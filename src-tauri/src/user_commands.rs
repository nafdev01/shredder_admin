use crate::initialize_app::Admin;
use crate::initialize_app::CustomError;
use sha1::Digest;
use tokio_postgres::NoTls;


#[tauri::command]
pub async fn get_admin(username: String) -> Result<Admin, CustomError> {
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
        "SELECT adminid, fullname, username, email, phone, department, created_at 
        FROM admins 
        WHERE username = $1",
        &[&username],
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

#[tauri::command]
pub async fn update_admin(
    adminid: i32,
    fullname: String,
    username: String,
    email: String,
    phone: String,
) -> Result<(), CustomError> {
    let (client, connection) = tokio_postgres::connect(
        "postgresql://priestley:PassMan2024@64.23.233.35/shredder",
        NoTls,
    ).await?;

    tokio::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("connection error: {}", e);
        }
    });

    client.execute(
        "UPDATE admins 
        SET fullname = $1, username = $2, email = $3, phone = $4
        WHERE adminid = $5",
        &[&fullname, &username, &email, &phone, &adminid],
    ).await?;

    Ok(())
}

#[tauri::command]
pub async fn change_admin_password(
    adminid: i32,
    oldpassword: String,
    newpassword: String,
) -> Result<(), CustomError> {
    if oldpassword == newpassword {
        return Err(CustomError::AuthenticationError(
            "New password must be different from the old password".to_string(),
        ));
    }

    let (client, connection) = tokio_postgres::connect(
        "postgresql://priestley:PassMan2024@64.23.233.35/shredder",
        NoTls,
    ).await?;

    tokio::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("connection error: {}", e);
        }
    });

    let user_iter = client.query(
        "SELECT password 
        FROM admins 
        WHERE adminid = $1",
        &[&adminid],
    ).await?;

    if let Some(user) = user_iter.iter().next() {
        let password: Option<String> = user.get::<_, Option<String>>("password");
        match password {
            Some(password) => {
                let oldhashed: String = hex::encode(sha1::Sha1::digest(oldpassword.as_bytes()));
                if password == oldhashed {
                    client.execute(
                        "UPDATE admins 
                        SET password = $1
                        WHERE adminid = $2",
                        &[
                            &hex::encode(sha1::Sha1::digest(newpassword.as_bytes())),
                            &adminid,
                        ],
                    ).await?;
                    Ok(())
                } else {
                    Err(CustomError::AuthenticationError(
                        "Incorrect password entered".to_string(),
                    ))
                }
            }
            None => Err(CustomError::AuthenticationError(
                "Incorrect password entered".to_string(),
            )),
        }
    } else {
        Err(CustomError::AuthenticationError(
            "Incorrect password entered".to_string(),
        ))
    }
}
