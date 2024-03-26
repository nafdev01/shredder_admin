use crate::initialize_app::{CustomError, Search};
use tokio_postgres::NoTls;


#[tauri::command]
pub async fn get_search_history(admin: i32) -> Result<Vec<Search>, CustomError> {
    let (client, connection) = tokio_postgres::connect(
        "postgresql://priestley:PassMan2024@64.23.233.35/shredder",
        NoTls,
    ).await?;

    tokio::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("connection error: {}", e);
        }
    });

    let rows = client.query(
        "SELECT word, directory, no_of_files, TO_CHAR(searched_at, 'YYYY/MM/DD HH12:MM:SS') AS search_date from searches 
        WHERE searcher = $1",
        &[&searcher],
    ).await?;

    let mut search_history = Vec::new();

    for row in &rows {
        let search = Search {
            searchid: searcher,
            searcher: (&"searcher").to_string(),
            word: row.get(0),
            directory: row.get(1),
            no_of_files: row.get(2),
            searched_at: row.get(3),
        };
        search_history.push(search);
    }

    Ok(search_history)
}
