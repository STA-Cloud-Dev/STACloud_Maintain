package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

//go:embed public logo
var siteFiles embed.FS

func main() {
	addr := ":" + env("PORT", "8080")

	publicFS := mustSub(siteFiles, "public")
	logoFS := mustSub(siteFiles, "logo")

	mux := http.NewServeMux()
	mux.Handle("/assets/", withHeaders(http.FileServer(http.FS(publicFS))))
	mux.Handle("/logo/", withHeaders(http.StripPrefix("/logo/", http.FileServer(http.FS(logoFS)))))
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" && r.URL.Path != "/index.html" {
			http.NotFound(w, r)
			return
		}

		w.Header().Set("Cache-Control", "no-store")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		http.ServeFileFS(w, r, publicFS, "index.html")
	})

	server := &http.Server{
		Addr:              addr,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Printf("STACloud maintenance page is available at http://localhost%s", addr)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}

func mustSub(source embed.FS, dir string) fs.FS {
	sub, err := fs.Sub(source, dir)
	if err != nil {
		log.Fatal(err)
	}
	return sub
}

func env(key string, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func withHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "public, max-age=300")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		next.ServeHTTP(w, r)
	})
}
