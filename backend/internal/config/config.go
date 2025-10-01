package config

import (
	"fmt"
	"os"
)

type Config struct {
	HTTPAddr    string
	DatabaseURL string
}

func Load() (Config, error) {
	cfg := Config{}

	httpAddr := os.Getenv("LOTBUY_HTTP_ADDR")
	if httpAddr == "" {
		httpAddr = ":8080"
	}
	cfg.HTTPAddr = httpAddr

	cfg.DatabaseURL = os.Getenv("LOTBUY_DATABASE_URL")
	if cfg.DatabaseURL == "" {
		return cfg, fmt.Errorf("LOTBUY_DATABASE_URL is not set")
	}

	return cfg, nil
}
