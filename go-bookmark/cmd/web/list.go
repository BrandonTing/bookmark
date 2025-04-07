package web

import (
	"encoding/json"
	"go-bookmark/internal/db"
	"log"
	"net/http"
	"strconv"
)

type Bookmark struct {
	url    string
	title  string
	labels string
	id     string
}

func ListHandler(w http.ResponseWriter, r *http.Request) {
	startIndex := 0
	bookmarks, err := GetList(startIndex)
	if err != nil {
		http.Error(w, "Error getting bookmarks", http.StatusBadRequest)
	}
	nextStart := strconv.Itoa(startIndex + 10)
	component := List(bookmarks, nextStart)
	err = component.Render(r.Context(), w)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Fatalf("Error rendering in ListHandler: %e", err)
	}
}

func AddListHandler(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
	}
	start := r.FormValue("start")
	println(start)
	if start == "" {
		start = "0"
	}
	startIndex, err := strconv.Atoi(start)
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
	}
	bookmarks, err := GetList(startIndex)
	if err != nil {
		http.Error(w, "Error getting bookmarks", http.StatusBadRequest)
	}
	nextStart := strconv.Itoa(startIndex + 10)
	component := ListComponent(bookmarks, nextStart)
	err = component.Render(r.Context(), w)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Fatalf("Error rendering in ListHandler: %e", err)
	}
}

func DeleteBookmarkHandler(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
	}
	id := r.FormValue("id")
	client, err := db.GetClient()
	if err != nil {
		http.Error(w, "No DB Client", http.StatusBadRequest)
	}
	_, _, err = client.From("bookmarks").Delete("", "").Eq("id", id).Execute()
	if err != nil {
		http.Error(w, "Error deleting bookmark", http.StatusBadRequest)
	}
}

func GetList(start int) ([]Bookmark, error) {
	client, err := db.GetClient()
	if err != nil {
		return []Bookmark{}, err
	}
	data, _, err := client.From("bookmarks").Select("*", "exact", false).Range(start, start+9, "").Execute()
	if err != nil {
		return []Bookmark{}, err
	}

	var records []map[string]interface{}
	err = json.Unmarshal(data, &records)
	if err != nil {
		return []Bookmark{}, err
	}

	var bookmarks []Bookmark
	for _, record := range records {
		bookmarks = append(bookmarks, Bookmark{
			url:    record["url"].(string),
			title:  record["title"].(string),
			labels: record["labels"].(string),
			id:     strconv.FormatFloat(record["id"].(float64), 'f', -1, 64),
		})
	}
	return bookmarks, nil
}
