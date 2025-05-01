const functions = require('firebase-functions');

/**
 * Main API handler for all endpoints
 */
exports.api = functions.https.onRequest((req, res) => {
  // Log the incoming request details for debugging
  console.log('==== INCOMING REQUEST ====');
  console.log(`Path: ${req.path}`);
  console.log(`Method: ${req.method}`);
  console.log('Headers:', JSON.stringify(req.headers));
  console.log('Body:', JSON.stringify(req.body));
  console.log('========================');

  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Ensure content type is application/json for all responses
  res.set('Content-Type', 'application/json');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request (preflight)');
    res.status(204).send('');
    return;
  }

  // Get the path, stripping any leading slashes
  const path = req.path.replace(/^\/+/, '').toLowerCase();
  
  console.log(`Processing request for path: ${path}`);
  
  // Route based on path
  if (path === 'parse-hand' || path === 'api/parse-hand') {
    // Handle parse-hand endpoint
    if (req.method !== 'POST') {
      console.log(`Method ${req.method} not allowed for /parse-hand`);
      res.status(405).json({ error: 'Method not allowed, use POST' });
      return;
    }
    
    try {
      // Get the description from the request body
      const description = req.body && req.body.description;
      
      console.log('Received description:', description ? description.substring(0, 100) + '...' : 'null or undefined');
      
      if (!description) {
        console.log('Missing description in request body');
        res.status(400).json({ error: 'Missing description in request body' });
        return;
      }
      
      // Create a response that matches the exact format expected by the iOS app
      const handHistoryResponse = {
        hand_history: {
          game_info: {
            table_size: 6,
            small_blind: 1,
            big_blind: 2,
            dealer_seat: 3
          },
          players: [
            {
              name: "Hero",
              seat: 1,
              stack: 205,
              position: "MP",
              is_hero: true,
              cards: ["Kc", "Kd"],
              final_hand: "Set of Kings",
              final_cards: ["Kc", "Kd", "Kh", "7d", "2c"]
            }
          ],
          streets: [
            {
              name: "preflop",
              cards: [],
              actions: [
                { player_name: "UTG", action: "fold", amount: 0, cards: null },
                { player_name: "Hero", action: "raise", amount: 7, cards: null }
              ]
            }
          ],
          pot: {
            amount: 328,
            distribution: [
              {
                player_name: "Hero",
                amount: 328,
                hand: "Set of Kings",
                cards: ["Kc", "Kd", "Kh", "7d", "2c"]
              }
            ],
            hero_pnl: 201
          }
        }
      };
      
      console.log('Sending response:', JSON.stringify(handHistoryResponse));
      
      // Return the response
      return res.json(handHistoryResponse);
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ 
        error: 'Error processing hand history',
        message: error.message || 'Unknown error'
      });
    }
  } else if (path === 'health') {
    // Handle health endpoint
    console.log('Health check endpoint called');
    res.json({ status: 'healthy' });
  } else {
    // Handle unknown endpoint
    console.log(`Unknown endpoint: ${req.path}`);
    res.status(404).json({ error: `Endpoint not found: ${req.path}` });
  }
}); 