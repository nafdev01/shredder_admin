use crate::initialize_app::{CustomError, Search};
use tokio_postgres::NoTls;


#[tauri::command]
pub async fn get_search_history(adminid: i32) -> Result<Vec<Search>, CustomError> {
    let (client, connection) = tokio_postgres::connect(
        "postgresql://priestley:PassMan2024@64.23.233.35/shredder",
        NoTls,
    ).await?;

    tokio::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("connection error: {}", e);
        }
    });

    // Get the department of the admin
    let row = client.query_one(
        "SELECT department FROM admins WHERE adminid = $1",
        &[&adminid],
    ).await?;
    let department: String = row.get(0);

    // Get all searches made by employees in that department
    let rows = client.query(
        "SELECT searchid, searcher, word, directory, no_of_files, TO_CHAR(searched_at, 'YYYY/MM/DD HH12:MM:SS') AS search_date 
        FROM searches 
        WHERE searcher IN (
            SELECT employeeid FROM employees WHERE department = $1
        )",
        &[&department],
    ).await?;

    let mut search_history = Vec::new();

    for row in &rows {
        let search = Search {
            searchid: row.get(0),
            searcher: row.get(1),
            word: row.get(2),
            directory: row.get(3),
            no_of_files: row.get(4),
            searched_at: row.get(5),
        };
        search_history.push(search);
    }

    Ok(search_history)
}
