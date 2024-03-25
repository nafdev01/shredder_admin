// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use notify_rust::Notification as DesktopNotification;
use notify_rust::Timeout;

mod auth_commands;
mod initialize_app;
mod search_commands;
mod user_commands;
mod shred_commands;

use crate::initialize_app::initialize_database;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    match initialize_database() {
        Ok(_) => {}
        Err(e) => {
            DesktopNotification::new()
                .summary("File Shredder Database Initialization Error!")
                .body(&e.to_string())
                .icon("32x32")
                .timeout(Timeout::Milliseconds(6000)) //milliseconds
                .show()
                .unwrap();
        }
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            auth_commands::authenticate_admin,
            user_commands::get_admin,
            user_commands::update_admin,
            user_commands::change_admin_password,
            shred_commands::get_pending_shred_requests,
            shred_commands::get_approved_shred_requests,
            shred_commands::get_denied_shred_requests,
            shred_commands::update_shred_request,
            search_commands::get_search_history,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
