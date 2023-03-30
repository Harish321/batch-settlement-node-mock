const express = require('express');
const app = express();

app.use(express.json());

let port = 6000;

let settlementDetails = []

// Mock data for testing purposes
const mockSettlementDetails = [
  {
    "id": 1,
    "version": 1,
    "originatorCode": "ABC",
    "dealName": "Deal 1",
    "originatorAccountNumber": "12345",
    "fromParty": "John Doe",
    "toParty": "Jane Smith",
    "fromAccount": "67890",
    "toAccount": "54321",
    "transactionType": "disbursement",
    "amount": 1000,
    "transactionId": "T001",
    "transactionReference": "TR001",
    "transactionDate": "2022-01-01",
    "settlementCycleDate": "2022-01-15",
    "stage": "completed",
    "bulkSettlementId": null
  },
  {
    "id": 2,
    "version": 1,
    "originatorCode": "DEF",
    "dealName": "Deal 2",
    "originatorAccountNumber": "56789",
    "fromParty": "Bob Smith",
    "toParty": "Alice Brown",
    "fromAccount": "24680",
    "toAccount": "13579",
    "transactionType": "collection",
    "amount": 500,
    "transactionId": "T002",
    "transactionReference": "TR002",
    "transactionDate": "2022-02-01",
    "settlementCycleDate": "2022-02-15",
    "stage": "in_progress",
    "bulkSettlementId": null
  },
  {
    "id": 3,
    "version": 1,
    "originatorCode": "GHI",
    "dealName": "Deal 3",
    "originatorAccountNumber": "98765",
    "fromParty": "Alice Brown",
    "toParty": "John Doe",
    "fromAccount": "13579",
    "toAccount": "24680",
    "transactionType": "preclosure",
    "amount": 750,
    "transactionId": "T003",
    "transactionReference": "TR003",
    "transactionDate": "2022-03-01",
    "settlementCycleDate": "2022-03-15",
    "stage": "pending",
    "bulkSettlementId": 1
  }
];

app.get('/api/batchSettlement/search', (req, res) => {
  // Extract post parameters from JSON body
  const { originatorCode, dealName, transactionType, fromParty, toParty, fromDate, toDate } = req.body;

  // Filter settlement details based on post parameters
  const filters = {
    originatorCode,
    dealName,
    transactionType,
    fromParty,
    toParty,
    transactionDate: {
      $gte: fromDate,
      $lte: toDate
    }
  };

  const filteredSettlementDetails = mockSettlementDetails.filter(settlement => {
    for (const [key, value] of Object.entries(filters)) {
      if (key === 'transactionDate') {
        if (value.$gte && new Date(settlement.transactionDate) < new Date(value.$gte)) {
          return false;
        }
        if (value.$lte && new Date(settlement.transactionDate) > new Date(value.$lte)) {
          return false;
        }
      } else if (value && key in settlement && settlement[key] !== value) {
        return false;
      }
    }
    return true;
  });
  // Map filtered settlement details to output JSON format
  const outputJson = {
    "id": null,
    "originatorCode": originatorCode || null,
    "dealName": dealName || null,
    "transactionType": transactionType || null,
    fromParty: fromParty || null,
    toParty: toParty || null,
    fromDate: fromDate || null,
    toDate : toDate || null,
    settlementDetails:filteredSettlementDetails
  }
  res.json(outputJson);
})


app.post('/api/batchSettlement/create', (req, res) => {
  const data = req.body
  const newSettlement = {
    id: null,
    originatorCode: data.originatorCode,
    dealName: data.dealName,
    transactionType: data.transactionType,
    fromParty: data.fromParty,
    toParty: data.toParty,
    fromDate: data.fromDate,
    toDate: data.toDate,
    settlementDetails: []
  }
  settlementDetails.push(newSettlement)
  res.json(newSettlement)
})

app.put('/api/batchSettlement/:id', (req, res) => {
  const id = req.params.id
  const data = req.body
  let settlement = settlementDetails.find(s => s.id === id)
  if (settlement) {
    settlement.originatorCode = data.originatorCode
    settlement.dealName = data.dealName
    settlement.transactionType = data.transactionType
    settlement.fromParty = data.fromParty
    settlement.toParty = data.toParty
    settlement.fromDate = data.fromDate
    settlement.toDate = data.toDate
    res.json(settlement)
  } else {
    const newSettlement = {
      id: id,
      originatorCode: data.originatorCode,
      dealName: data.dealName,
      transactionType: data.transactionType,
      fromParty: data.fromParty,
      toParty: data.toParty,
      fromDate: data.fromDate,
      toDate: data.toDate,
      settlementDetails: []
    }
    settlementDetails.push(newSettlement)
    res.json(newSettlement)
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})