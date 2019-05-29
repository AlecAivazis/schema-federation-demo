package main

import (
	"context"
	"fmt"
	"net/http"

	"github.com/nautilus/gateway"
	"github.com/nautilus/graphql"
)

func main() {
	// introspect the apis
	schemas, err := graphql.IntrospectRemoteSchemas(
		"http://localhost:3000/",
		"http://localhost:3001/",
		"http://localhost:3002"
	)
	if err != nil {
		panic(err)
	}

	// create the gateway instance
	gw, err := gateway.New(schemas)
	if err != nil {
		panic(err)
	}

	// add the playground endpoint to the router
	http.HandleFunc("/graphql", withUserInfo(gw.PlaygroundHandler))

	// start the server
	fmt.Println("Starting server")
	err = http.ListenAndServe(":3001", nil)
	if err != nil {
		fmt.Println(err.Error())
	}
}