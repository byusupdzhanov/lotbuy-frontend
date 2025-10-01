package server

import (
	"context"
	"net/http"
	"strings"
)

type ctxKey string

const paramsKey ctxKey = "routeParams"

type Route struct {
	Method  string
	Pattern string
	Handler http.HandlerFunc
}

type Router struct {
	routes []Route
}

func NewRouter() *Router {
	return &Router{routes: make([]Route, 0)}
}

func (r *Router) Handle(method, pattern string, handler http.HandlerFunc) {
	r.routes = append(r.routes, Route{Method: method, Pattern: pattern, Handler: handler})
}

func (r *Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	path := req.URL.Path
	for _, route := range r.routes {
		if route.Method != "" && route.Method != req.Method {
			continue
		}
		if params, ok := matchPattern(route.Pattern, path); ok {
			ctx := context.WithValue(req.Context(), paramsKey, params)
			route.Handler.ServeHTTP(w, req.WithContext(ctx))
			return
		}
	}
	http.NotFound(w, req)
}

func matchPattern(pattern, path string) (map[string]string, bool) {
	pattern = strings.TrimSuffix(pattern, "/")
	path = strings.TrimSuffix(path, "/")
	if pattern == "" {
		pattern = "/"
	}
	if path == "" {
		path = "/"
	}

	patternParts := strings.Split(pattern, "/")
	pathParts := strings.Split(path, "/")

	if len(patternParts) != len(pathParts) {
		return nil, false
	}

	params := make(map[string]string)
	for i := range patternParts {
		pp := patternParts[i]
		sp := pathParts[i]
		if strings.HasPrefix(pp, ":") {
			params[pp[1:]] = sp
			continue
		}
		if pp != sp {
			return nil, false
		}
	}
	return params, true
}

func Param(r *http.Request, name string) string {
	params, _ := r.Context().Value(paramsKey).(map[string]string)
	if params == nil {
		return ""
	}
	return params[name]
}
