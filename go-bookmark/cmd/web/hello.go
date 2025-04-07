package web

import (
	"go-bookmark/internal/db"
	"log"
	"net/http"
)

func HelloWebHandler(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
	}
	client, err := db.GetClient()
	if err != nil {
		http.Error(w, "No DB Client", http.StatusBadRequest)
	}
	_, count, err := client.From("bookmarks").Select("*", "exact", false).Execute()
	if err != nil {
		http.Error(w, "Error querying", http.StatusBadRequest)
	}
	println(count)
	name := r.FormValue("name")
	component := HelloPost(name)
	err = component.Render(r.Context(), w)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Fatalf("Error rendering in HelloWebHandler: %e", err)
	}
}
