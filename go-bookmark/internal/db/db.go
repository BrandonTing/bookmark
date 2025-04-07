package db

import (
	"os"

	"github.com/supabase-community/supabase-go"
)

var (
	SupabaseURL    = os.Getenv("BLUEPRINT_SUPABASE_URL")
	SupabaseAPIKey = os.Getenv("BLUEPRINT_SUPABASE_API_KEY")
)

func GetClient() (*supabase.Client, error) {
	return supabase.NewClient(SupabaseURL, SupabaseAPIKey, &supabase.ClientOptions{})
}
