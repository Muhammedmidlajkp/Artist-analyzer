// 1. Go to Google Sheets
// 2. Create a new Sheet, name the first tab "Data"
// 3. Set up headers in Row 1: 
//    Record ID | Event Date | Bride Name | Source | Referred By | Artist Reference | Artist | Package Price | Extra Charges | Discount | Total Revenue | Satisfaction | Issue Note
// 4. Click Extensions > Apps Script
// 5. Paste this code, save, click Deploy > New Deployment
// 6. Select Type = Web App, Execute As = "Me", Who has access = "Anyone"

const SHEET_NAME = 'Data';

// --- MONGODB CONFIGURATION ---
// Get these from MongoDB Atlas > Data API
const MONGO_CONFIG = {
  apiKey: 'YOUR_MONGODB_DATA_API_KEY',
  urlBase: 'https://data.mongodb-api.com/app/YOUR_APP_ID/endpoint/data/v1/action',
  cluster: 'Cluster0',
  database: 'ArtistAnalysis',
  collection: 'entries'
};

function doPost(e) {
  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheetByName(SHEET_NAME);
    
    const body = JSON.parse(e.postData.contents);
    const action = body.action || 'create';
    const data = body.data;
    const entries = Array.isArray(data) ? data : [data];
    
    // --- GOOGLE SHEETS LOGIC ---
    if (action === 'delete') {
      const idToDelete = entries[0].recordId.toString().trim();
      const values = sheet.getDataRange().getValues();
      for (let i = 1; i < values.length; i++) {
        if (values[i][0].toString().trim() === idToDelete) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
      // MongoDB Delete
      mongoAction('deleteOne', { filter: { recordId: idToDelete } });
      
      return response({ status: 'success', message: 'Record deleted' });
    }
    
    if (action === 'update') {
      const entryToUpdate = entries[0];
      const idToUpdate = entryToUpdate.recordId.toString().trim();
      const values = sheet.getDataRange().getValues();
      let found = false;
      for (let i = 1; i < values.length; i++) {
        if (values[i][0].toString().trim() === idToUpdate) {
          const rowData = [
            idToUpdate,
            entryToUpdate.eventDate || '',
            entryToUpdate.brideName || '',
            entryToUpdate.source || '',
            entryToUpdate.referredBy || '',
            entryToUpdate.artistReference || '',
            entryToUpdate.artist || '',
            entryToUpdate.packagePrice || 0,
            entryToUpdate.extraCharges || 0,
            entryToUpdate.discount || 0,
            entryToUpdate.totalRevenue || 0,
            entryToUpdate.satisfaction || '',
            entryToUpdate.issueNote || ''
          ];
          sheet.getRange(i + 1, 1, 1, 13).setValues([rowData]);
          found = true;
          break;
        }
      }
      
      // MongoDB Update
      mongoAction('updateOne', { 
        filter: { recordId: idToUpdate },
        update: { $set: entryToUpdate },
        upsert: true
      });
      
      return response({ status: found ? 'success' : 'partial_success', message: found ? 'Updated everywhere' : 'Updated in MongoDB only' });
    }

    // Default: CREATE
    const rows = entries.map(item => {
      const recordId = item.recordId || ('ID-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000));
      return [
        recordId,
        item.eventDate || '',
        item.brideName || '',
        item.source || '',
        item.referredBy || '',
        item.artistReference || '',
        item.artist || '',
        item.packagePrice || 0,
        item.extraCharges || 0,
        item.discount || 0,
        item.totalRevenue || 0,
        item.satisfaction || '',
        item.issueNote || ''
      ];
    });
    
    if (rows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 13).setValues(rows);
      
      // MongoDB Insert
      const mongoDocs = entries.map((item, idx) => {
        item.recordId = rows[idx][0]; // Ensure ID consistency
        return item;
      });
      mongoAction('insertMany', { documents: mongoDocs });
    }
    
    return response({ status: 'success', message: `${rows.length} rows inserted` });
  } catch (error) {
    return response({ status: 'error', message: error.toString() });
  }
}

function doGet(e) {
  try {
    // You can choose to fetch from MongoDB for better performance
    // const mongoData = mongoAction('find', { filter: {} });
    // if (mongoData && mongoData.documents) return response({ status: 'success', data: mongoData.documents });

    // Fallback to Sheets
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) return response({ status: 'success', data: [] });
    
    const headers = data[0];
    const formattedData = data.slice(1).map(row => {
      let obj = {};
      row.forEach((val, index) => {
        let key = headers[index].toString().trim().replace(/(?:^\w|[A-Z]|\b\w)/g, (word, idx) => {
           return idx === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
        obj[key] = val;
      });
      return obj;
    });
    
    return response({ status: 'success', data: formattedData });
  } catch (error) {
    return response({ status: 'error', message: error.toString() });
  }
}

// --- HELPER FUNCTIONS ---

function response(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function mongoAction(action, payload) {
  if (MONGO_CONFIG.apiKey === 'YOUR_MONGODB_DATA_API_KEY') return null; // Skip if not configured

  const url = `${MONGO_CONFIG.urlBase}/${action}`;
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'api-key': MONGO_CONFIG.apiKey },
    payload: JSON.stringify({
      collection: MONGO_CONFIG.collection,
      database: MONGO_CONFIG.database,
      dataSource: MONGO_CONFIG.cluster,
      ...payload
    }),
    muteHttpExceptions: true
  };

  try {
    const res = UrlFetchApp.fetch(url, options);
    return JSON.parse(res.getContentText());
  } catch (err) {
    Logger.log('MongoDB Error: ' + err.toString());
    return null;
  }
}
