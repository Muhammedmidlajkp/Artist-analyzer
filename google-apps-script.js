// 1. Go to Google Sheets
// 2. Create a new Sheet, name the first tab "Data"
// 3. Set up headers in Row 1: 
//    Record ID | Event Date | Bride Name | Source | Referred By | Artist Reference | Artist | Package Price | Extra Charges | Discount | Total Revenue | Satisfaction | Issue Note
// 4. Click Extensions > Apps Script
// 5. Paste this code, save, click Deploy > New Deployment
// 6. Select Type = Web App, Execute As = "Me", Who has access = "Anyone"

const SHEET_NAME = 'Data';

function doPost(e) {
  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheetByName(SHEET_NAME);
    
    // Parse the payload sent from the frontend
    const body = JSON.parse(e.postData.contents);
    const action = body.action || 'create';
    const data = body.data;
    const entries = Array.isArray(data) ? data : [data];
    
    if (action === 'delete') {
      const idToDelete = entries[0].recordId;
      const values = sheet.getDataRange().getValues();
      for (let i = 1; i < values.length; i++) {
        if (values[i][0].toString() === idToDelete.toString()) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Record deleted' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'update') {
      const entryToUpdate = entries[0];
      const idToUpdate = entryToUpdate.recordId;
      const values = sheet.getDataRange().getValues();
      for (let i = 1; i < values.length; i++) {
        if (values[i][0].toString() === idToUpdate.toString()) {
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
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Record updated' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Default: CREATE
    const rows = entries.map(item => [
      item.recordId || ('ID-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000)),
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
    ]);
    
    if (rows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 13).setValues(rows);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: `${rows.length} rows inserted`, data: rows }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheetByName(SHEET_NAME);
    
    const data = sheet.getDataRange().getValues();
    
    // Convert 2D array to an array of objects
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    const formattedData = rows.map(row => {
      let obj = {};
      row.forEach((val, index) => {
        // Map header name to camelCase object key (e.g. "Event Date" -> "eventDate")
        let key = headers[index].toString().trim().replace(/(?:^\w|[A-Z]|\b\w)/g, (word, idx) => {
           return idx === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
        obj[key] = val;
      });
      return obj;
    });
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: formattedData }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
