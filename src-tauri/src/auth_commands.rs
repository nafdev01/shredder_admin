use crate::initialize_app::Admin;
use crate::initialize_app::CustomError;
use sha1::Digest;
use tokio_postgres::NoTls;


#[tauri::command]
pub async fn authenticate_admin(username: String, password: String) -> Result<Admin, CustomError> {
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
        "SELECT adminid, fullname, username, email, phone, department 
        FROM admins 
        WHERE username = $1 AND password = $2",
        &[
            &username,
            &hex::encode(sha1::Sha1::digest(password.as_bytes())),
        ],
    ).await?;

    if let Some(row) = rows.iter().next() {
        Ok(Admin {
            adminid: row.get(0),
            fullname: row.get(1),
            username: row.get(2),
            email: row.get(3),
            phone: row.get(4),
            department: row.get(5),
        })
    } else {
        Err(CustomError::AuthenticationError(
            "Invalid username or password".to_string(),
        ))
    }
}
