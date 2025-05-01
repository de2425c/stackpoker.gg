import Foundation

// Type alias for clarity
typealias HandHistory = [String: Any]

enum HandParserError: Error {
    case invalidURL
    case networkError(Error)
    case invalidResponse
    case serverError(String)
    case decodingError(Error)
    case invalidHTMLResponse
    
    var message: String {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .invalidResponse:
            return "Invalid response from server"
        case .serverError(let message):
            return message
        case .decodingError(let error):
            return "Failed to decode response: \(error.localizedDescription)"
        case .invalidHTMLResponse:
            return "Server returned HTML instead of JSON"
        }
    }
}

class HandParserService {
    static let shared = HandParserService()
    
    // For testing with Firebase Functions
    private let baseURL = "https://stack-24dea.web.app/api"
    
    func parseHand(description: String) async throws -> ParsedHandHistory {
        guard let url = URL(string: "\(baseURL)/parse-hand") else {
            throw HandParserError.invalidURL
        }
        
        print("🔵 Sending request to: \(url.absoluteString)")
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        let body: [String: Any] = ["description": description]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        // Debug: Print the request we're sending
        print("🔵 Request Method: \(request.httpMethod ?? "Unknown")")
        print("🔵 Request Headers: \(request.allHTTPHeaderFields ?? [:])")
        if let bodyData = request.httpBody, let bodyString = String(data: bodyData, encoding: .utf8) {
            print("🔵 Request Body: \(bodyString)")
        }
        
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            
            // Debug: Print received data
            print("🟢 Response Status: \((response as? HTTPURLResponse)?.statusCode ?? -1)")
            print("🟢 Response Headers: \((response as? HTTPURLResponse)?.allHeaderFields ?? [:])")
            
            if let jsonString = String(data: data, encoding: .utf8) {
                print("🟢 Received Data: \(jsonString)")
                
                // Check if we received HTML instead of JSON
                if jsonString.contains("<!DOCTYPE html>") || jsonString.contains("<html") {
                    print("❌ ERROR: Received HTML instead of JSON")
                    throw HandParserError.invalidHTMLResponse
                }
            }
            
            guard let httpResponse = response as? HTTPURLResponse else {
                print("❌ ERROR: Response is not HTTPURLResponse")
                throw HandParserError.invalidResponse
            }
            
            if httpResponse.statusCode == 400 {
                if let errorResponse = try? JSONDecoder().decode([String: String].self, from: data),
                   let detail = errorResponse["detail"] {
                    print("❌ ERROR: Server returned 400 with detail: \(detail)")
                    throw HandParserError.serverError(detail)
                } else {
                    print("❌ ERROR: Server returned 400 without details")
                    throw HandParserError.serverError("Bad Request")
                }
            }
            
            guard httpResponse.statusCode == 200 else {
                print("❌ ERROR: Server returned status code \(httpResponse.statusCode)")
                throw HandParserError.serverError("Server returned status code \(httpResponse.statusCode)")
            }
            
            // Try to parse as JSON
            guard let rawDict = try? JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] else {
                print("❌ ERROR: Failed to parse response as JSON")
                throw HandParserError.invalidResponse
            }
            
            print("🟢 Parsed JSON: \(rawDict)")
            
            // Check for hand_history structure
            if let handHistory = rawDict["hand_history"] as? [String: Any] {
                print("🟢 Found hand_history in response")
                
                // Create the expected structure
                let wrappedDict: [String: Any] = ["raw": handHistory]
                let wrappedData = try JSONSerialization.data(withJSONObject: wrappedDict)
                
                let decoder = JSONDecoder()
                do {
                    return try decoder.decode(ParsedHandHistory.self, from: wrappedData)
                } catch {
                    print("❌ ERROR: Decoding error: \(error)")
                    throw HandParserError.decodingError(error)
                }
            } else {
                print("❌ ERROR: Response missing hand_history field")
                print("❌ Available fields: \(rawDict.keys.joined(separator: ", "))")
                throw HandParserError.invalidResponse
            }
            
        } catch let error as HandParserError {
            print("❌ HandParserError: \(error.message)")
            throw error
        } catch {
            print("❌ Network Error: \(error.localizedDescription)")
            throw HandParserError.networkError(error)
        }
    }
}

// This is a placeholder - replace with your actual model
struct ParsedHandHistory: Decodable {
    let raw: HandHistoryRaw
}

// This is a placeholder - replace with your actual structure
struct HandHistoryRaw: Decodable {
    // Add your actual fields here
    let game_info: GameInfo
    
    // Add other fields as needed
}

struct GameInfo: Decodable {
    let table_size: Int
    let small_blind: Double
    let big_blind: Double
    // Add other fields as needed
} 