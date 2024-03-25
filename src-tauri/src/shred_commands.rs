use crate::initialize_app::CustomError;
use crate::initialize_app::ShredRequest;
use tokio_postgres::NoTls;


#[tauri::command]
pub async fn get_pending_shred_requests(requestto: i32) -> Result<Vec<ShredRequest>, CustomError> {
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
        "SELECT requestid, requestby, filepath, department, requeststatus, TO_CHAR(requestat, 'YYYY/MM/DD HH12:MM:SS') AS request_date from shredrequests 
        WHERE requestto = $1 and requeststatus = 'Pending'",
        &[&requestto],
    ).await?;

    let mut shredrequests = Vec::new();

    for row in &rows {
        let shredrequest = ShredRequest {
            requestid: row.get(0),
            requestby: row.get(1),
            filepath: row.get(2),
            department: row.get(3),
            requestto: requestto,
            requeststatus: row.get(4),
            requestat: row.get(5),
        };
        shredrequests.push(shredrequest);
    }

    Ok(shredrequests)
}

#[tauri::command]
pub async fn get_denied_shred_requests(requestto: i32) -> Result<Vec<ShredRequest>, CustomError> {
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
        "SELECT requestid, requestby, filepath, department, requeststatus, TO_CHAR(requestat, 'YYYY/MM/DD HH12:MM:SS') AS request_date from shredrequests 
        WHERE requestto = $1 and requeststatus = 'Denied'",
        &[&requestto],
    ).await?;

    let mut shredrequests = Vec::new();

    for row in &rows {
        let shredrequest = ShredRequest {
            requestid: row.get(0),
            requestby: row.get(1),
            filepath: row.get(2),
            department: row.get(3),
            requestto: requestto,
            requeststatus: row.get(4),
            requestat: row.get(5),
        };
        shredrequests.push(shredrequest);
    }

    Ok(shredrequests)
}

#[tauri::command]
pub async fn get_approved_shred_requests(requestto: i32) -> Result<Vec<ShredRequest>, CustomError> {
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
        "SELECT requestid, requestby, filepath, department, requeststatus, TO_CHAR(requestat, 'YYYY/MM/DD HH12:MM:SS') AS request_date from shredrequests 
        WHERE requestto = $1 and requeststatus = 'Approved'",
        &[&requestto],
    ).await?;

    let mut shredrequests = Vec::new();

    for row in &rows {
        let shredrequest = ShredRequest {
            requestid: row.get(0),
            requestby: row.get(1),
            filepath: row.get(2),
            department: row.get(3),
            requestto: requestto,
            requeststatus: row.get(4),
            requestat: row.get(5),
        };
        shredrequests.push(shredrequest);
    }

    Ok(shredrequests)
}

#[tauri::command]
pub async fn update_shred_request(requestid: i32, requeststatus: String) -> Result<String, String> {
    let (client, connection) = tokio_postgres::connect(
        "postgresql://priestley:PassMan2024@64.23.233.35/shredder",
        NoTls,
    ).await.map_err(|e| format!("Failed to connect to the database: {}", e))?;

    tokio::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("connection error: {}", e);
        }
    });

    client.execute(
        "UPDATE shredrequests SET requeststatus = $1 WHERE requestid = $2",
        &[&requeststatus, &requestid],
    ).await.map(|_| "Success".to_string()).map_err(|e| format!("Failed to execute query: {}", e))
}