package main

import (
	"fmt"
	"net/http"
	"context"

	"github.com/vektah/gqlparser/ast"

	"github.com/nautilus/gateway"
	"github.com/nautilus/graphql"
)

// withUserInfo is an http middleware that grabs the user's authorization credentials
// and injects them in the request context
func withUserInfo(handler http.HandlerFunc) http.HandlerFunc {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // look up the value of the Authorization header
        tokenValue := r.Header.Get("Authorization")

        // here is where you would perform some kind of validation on the token
        // but we're going to skip that for this example and save it as the
        // id directly. PLEASE, DO NOT DO THIS IN PRODUCTION.

        // invoke the handler with the new context
        handler.ServeHTTP(w, r.WithContext(
            context.WithValue(r.Context(), "user-id", tokenValue),
        ))
    })
}

// forwardUserID is a gateway request middleware that includes the context value
// in outbound requests for services to use
var forwardUserID = gateway.RequestMiddleware(func(r *http.Request) error {
    // the initial context of the request is set to match the one we modified earlier

    // we are safe to extract the value we saved in context
    if userID := r.Context().Value("user-id"); userID != nil {
        // set the header with the value we pulled out of context
        r.Header.Set("USER_ID", userID.(string))
    }

    // there was no error
    return nil
})

// viewerField adds a field to the root of the API that points to the current user
var viewerField = &gateway.QueryField{
    Name: "viewer",
    Type: ast.NamedType("User", &ast.Position{}),
    // this function must return the ID of the object that the field resolves to
    Resolver: func(ctx context.Context, args map[string]interface{}) (string, error) {
        // for now just return the value in context
        return ctx.Value("user-id").(string), nil
    },
}

func main() {
	// introspect the apis
	schemas, err := graphql.IntrospectRemoteSchemas(
		"http://localhost:3001/",
		"http://localhost:3002/",
		"http://localhost:3003",
	)
	if err != nil {
		panic(err)
	}

	// create the gateway instance
	gw, err := gateway.New(schemas, 
		gateway.WithMiddlewares(forwardUserID), 
		gateway.WithQueryFields(viewerField),
	)
	if err != nil {
		panic(err)
	}

	// add the playground endpoint to the router
	http.HandleFunc("/graphql", withUserInfo(gw.PlaygroundHandler))

	// start the server
	fmt.Println("Starting server")
	err = http.ListenAndServe(":3000", nil)
	if err != nil {
		fmt.Println(err.Error())
	}
}
