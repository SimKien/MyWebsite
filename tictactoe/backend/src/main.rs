use axum::{routing::get_service, Router};
use tower_http::services::{ServeDir, ServeFile};

const FRONTEND_PATH: &str = "../frontend/dist";

#[tokio::main]
async fn main() {
    let app = Router::new().nest_service(
        "/",
        get_service(
            ServeDir::new(FRONTEND_PATH)
                .fallback(ServeFile::new(&format!("{}/index.html", FRONTEND_PATH))),
        ),
    );
    let port = std::env::var("CHESS_PORT").unwrap_or_else(|_| "8080".to_string());

    axum::Server::bind(&format!("0.0.0.0:{}", port).parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
