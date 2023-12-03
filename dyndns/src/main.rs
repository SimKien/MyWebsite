use std::{collections::HashMap, process::Command};

use reqwest::{
    header::{AUTHORIZATION, CONTENT_TYPE},
    Client,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

const AUTHORIZATION_TOKEN: &str = "dbma-Og44DS-Ht5J_wWmOXDZ87-BMwzE6YAiUXS7";

#[derive(Deserialize, Serialize, Debug)]
struct UpdateRequest {
    zone: String,
    record_name: String,
    record_type: String,
    record_content: String,
    comment: String,
    record_ttl: u32,
    proxied: bool,
}

#[tokio::main]
async fn main() {
    let config_dir = std::env::var("DYNDNS_CONFIG").unwrap_or_else(|_| String::from("./"));
    let config = match std::fs::read_to_string(format!("{}config.json", config_dir)) {
        Ok(x) => x,
        Err(_) => {
            println!("Could not read config file");
            return;
        }
    };

    let update_requests: Vec<UpdateRequest> = serde_json::from_str(&config).unwrap();

    let zones = fetch_zones().await;

    for update_request in update_requests {
        let zone_id = zones.get(&update_request.zone).unwrap().clone();

        let url_all_records = format!(
            "https://api.cloudflare.com/client/v4/zones/{}/dns_records",
            zone_id
        );
        let client = reqwest::Client::new();
        let all_records_data = client
            .get(url_all_records)
            .header(
                AUTHORIZATION,
                format!("Bearer {}", String::from(AUTHORIZATION_TOKEN)),
            )
            .header(CONTENT_TYPE, "application/json")
            .send()
            .await
            .unwrap()
            .text()
            .await
            .unwrap();
        let all_records_json: Value = serde_json::from_str(&all_records_data).unwrap();
        let all_records = all_records_json
            .get("result")
            .unwrap()
            .as_array()
            .unwrap()
            .to_vec();
        let record_id = &all_records
            .iter()
            .find(|x| {
                (x.get("type").unwrap().to_string().replace("\"", "") == update_request.record_type)
                    && (x.get("name").unwrap().to_string().replace("\"", "")
                        == format!("{}.{}", update_request.record_name, update_request.zone)
                        || (x.get("name").unwrap().to_string().replace("\"", "")
                            == update_request.zone
                            && ((update_request.record_name == String::from("@"))
                                || (update_request.record_name == update_request.zone))))
            })
            .map(|record| record.get("id").unwrap().to_string().replace("\"", ""));
        match record_id {
            Some(record_id) => {
                println!("Update record {}....", update_request.record_name);
                update(&zone_id, record_id, &update_request).await;
            }
            None => {
                println!("Create record {}....", update_request.record_name);
                create(&zone_id, &update_request).await;
            }
        }
    }
    println!("Successfully updated all records");
}

async fn create(zone_id: &String, update_request: &UpdateRequest) {
    let url = format!(
        "https://api.cloudflare.com/client/v4/zones/{}/dns_records",
        zone_id
    );

    let mut new_record_json = json!({
        "content": "",
        "name": update_request.record_name,
        "proxied": update_request.proxied,
        "type": update_request.record_type,
        "comment": update_request.comment,
        "tags": [],
        "ttl": update_request.record_ttl,
    });

    if update_request.record_content == String::from("") {
        let ip = match fetch_ip(&update_request.record_type).await {
            Some(x) => x,
            None => {
                return;
            }
        };
        new_record_json["content"] = json!(ip);
    } else {
        new_record_json["content"] = json!(update_request.record_content);
    };

    let new_record = serde_json::to_string(&new_record_json).unwrap();
    let client = Client::new();
    client
        .post(url)
        .header(
            AUTHORIZATION,
            format!("Bearer {}", String::from(AUTHORIZATION_TOKEN)),
        )
        .header(CONTENT_TYPE, "application/json")
        .body(new_record.clone())
        .send()
        .await
        .unwrap()
        .text()
        .await
        .unwrap();
    println!("Successfully created record {}", update_request.record_name);
}

async fn update(zone_id: &String, record_id: &String, update_request: &UpdateRequest) {
    let url = format!(
        "https://api.cloudflare.com/client/v4/zones/{}/dns_records/{}",
        zone_id, record_id
    );
    let current_record: Value = fetch_record(&zone_id, &record_id)
        .await
        .get("result")
        .unwrap()
        .clone();

    let mut new_record_json = json!({
        "content": "",
        "name": update_request.record_name,
        "proxied": update_request.proxied,
        "type": update_request.record_type,
        "comment": update_request.comment,
        "tags": current_record.get("tags").unwrap(),
        "ttl": update_request.record_ttl,
    });

    if update_request.record_content == String::from("") {
        let ip = match fetch_ip(&update_request.record_type).await {
            Some(x) => x,
            None => {
                return;
            }
        };
        new_record_json["content"] = json!(ip);
    } else {
        new_record_json["content"] = json!(update_request.record_content);
    };

    if (new_record_json["content"].to_string()
        == current_record.get("content").unwrap().to_string())
        && (new_record_json["name"].to_string() == current_record.get("name").unwrap().to_string())
        && (new_record_json["proxied"].to_string()
            == current_record.get("proxied").unwrap().to_string())
        && (new_record_json["type"].to_string() == current_record.get("type").unwrap().to_string())
        && (new_record_json["ttl"].to_string() == current_record.get("ttl").unwrap().to_string())
    {
        println!("Record {} already up to date", update_request.record_name);
        return;
    }

    let new_record = serde_json::to_string(&new_record_json).unwrap();
    let client = Client::new();
    client
        .put(url)
        .header(
            AUTHORIZATION,
            format!("Bearer {}", String::from(AUTHORIZATION_TOKEN)),
        )
        .header(CONTENT_TYPE, "application/json")
        .body(new_record.clone())
        .send()
        .await
        .unwrap()
        .text()
        .await
        .unwrap();
    println!("Successfully updated record {}", update_request.record_name);
}

async fn fetch_ip(ip_type: &String) -> Option<String> {
    if ip_type == &String::from("AAAA") {
        let output = Command::new("curl").arg("https://6.myip.is/").output();
        let ip = match output {
            Ok(x) => String::from_utf8(x.stdout).unwrap(),
            Err(_) => {
                return None;
            }
        };
        if ip == String::from("") {
            return None;
        }
        let ip: Value = serde_json::from_str(&ip).unwrap();
        let ip = ip.get("ip").unwrap().to_string().replace("\"", "");
        println!("Fetched Ipv6-Adress: {}", ip);
        return Some(ip);
    } else {
        let output = Command::new("curl").arg("https://4.myip.is/").output();
        let ip = match output {
            Ok(x) => String::from_utf8(x.stdout).unwrap(),
            Err(_) => {
                return None;
            }
        };
        if ip == String::from("") {
            return None;
        }
        let ip: Value = serde_json::from_str(&ip).unwrap();
        let ip = ip.get("ip").unwrap().to_string().replace("\"", "");
        println!("Fetched Ipv4-Adress: {}", ip);
        return Some(ip);
    }
}

async fn fetch_record(zone_id: &String, record_id: &String) -> Value {
    let url = format!(
        "https://api.cloudflare.com/client/v4/zones/{}/dns_records/{}",
        zone_id, record_id
    );
    let client = reqwest::Client::new();
    let current_data = client
        .get(url)
        .header(
            AUTHORIZATION,
            format!("Bearer {}", String::from(AUTHORIZATION_TOKEN)),
        )
        .header(CONTENT_TYPE, "application/json")
        .send()
        .await
        .unwrap()
        .text()
        .await
        .unwrap();
    let current_record: Value = serde_json::from_str(&current_data).unwrap();
    current_record
}

async fn fetch_zones() -> HashMap<String, String> {
    let mut zones: HashMap<String, String> = HashMap::new();

    let url = String::from("https://api.cloudflare.com/client/v4/zones");
    let client = reqwest::Client::new();
    let zones_data = client
        .get(url)
        .header(
            AUTHORIZATION,
            format!("Bearer {}", String::from(AUTHORIZATION_TOKEN)),
        )
        .header(CONTENT_TYPE, "application/json")
        .send()
        .await
        .unwrap()
        .text()
        .await
        .unwrap();
    let zones_json: Value = serde_json::from_str(&zones_data).unwrap();
    let zones_json = zones_json
        .get("result")
        .unwrap()
        .as_array()
        .unwrap()
        .to_vec();
    for zone in zones_json {
        let name = zone.get("name").unwrap().to_string().replace("\"", "");
        let id = zone.get("id").unwrap().to_string().replace("\"", "");
        zones.insert(name, id);
    }
    zones
}
