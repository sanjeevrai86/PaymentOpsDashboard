import type { Transaction, FlowNode } from '@/types';

const successFlow: FlowNode[] = [
  { id: 'ch', label: 'Channels', type: 'channel', status: 'success', detail: 'Inbound payment initiated via Online Banking API' },
  { id: 'mw', label: 'Middleware', type: 'middleware', status: 'success', detail: 'Message validated, enriched, and routed' },
  { id: 'pp', label: 'Payment Processor', type: 'processor', status: 'success', detail: 'Orchestrated debit/credit cycle' },
  { id: 'cl', label: 'Clearing', type: 'clearing', status: 'success', detail: 'Pacs.008 settled successfully' },
  { id: 'fr', label: 'Fraud', type: 'fraud', status: 'success', detail: 'Risk score: 12 / 100 — low risk' },
  { id: 'co', label: 'Compliance', type: 'compliance', status: 'success', detail: 'Sanctions screening passed' },
  { id: 'cb', label: 'Core Banking', type: 'corebanking', status: 'success', detail: 'Debit and credit posted successfully' },
  { id: 'ad', label: 'Advices', type: 'advices', status: 'success', detail: 'Camt.054 debit advice generated' },
];

export const transactions: Transaction[] = [
  // Scenario A: Compliance Hold (Pacs.002 reject via Compliance check 1.b)
  {
    id: 'TXN-20260915-00481',
    endToEndId: 'E2E-FN-887712-00481',
    debitMOP: 'FedNow',
    creditMOP: 'FedNow',
    amount: 145000.0,
    currency: 'USD',
    status: 'Rejected',
    timestamp: '2026-09-15T09:14:32Z',
    scenario: 'Compliance Hold — Sanctions screening rejection',
    debtorName: 'Apex Logistics LLC',
    creditorName: 'Meridian Trading FZ-LLC',
    debtorAccount: '00114092837',
    creditorAccount: '88210937461',
    flowNodes: [
      { id: 'ch', label: 'Channels', type: 'channel', status: 'success', detail: 'Inbound FedNow payment via Online Banking API' },
      { id: 'mw', label: 'Middleware', type: 'middleware', status: 'success', detail: 'Pain.001 received, validated and enriched' },
      { id: 'pp', label: 'Payment Processor', type: 'processor', status: 'failed', detail: 'Processor halted pending compliance outcome' },
      { id: 'cl', label: 'Clearing', type: 'clearing', status: 'idle', detail: 'Not triggered — payment rejected before clearing' },
      { id: 'fr', label: 'Fraud', type: 'fraud', status: 'success', detail: 'Risk score: 34 / 100 — within threshold' },
      { id: 'co', label: 'Compliance', type: 'compliance', status: 'failed', detail: 'OFAC sanctions match: beneficiary name flagged (score 0.91)' },
      { id: 'cb', label: 'Core Banking', type: 'corebanking', status: 'idle', detail: 'Not triggered' },
      { id: 'ad', label: 'Advices', type: 'advices', status: 'idle', detail: 'Not triggered' },
    ],
    isoMessages: [
      {
        type: 'Pain.001',
        messageType: 'CustomerCreditTransferInitiation',
        direction: 'Outbound (Channels → Middleware)',
        rawPayload: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>MSG-FN-887712</MsgId>
      <CreDtTm>2026-09-15T09:14:28Z</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <CtrlSum>145000.00</CtrlSum>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PMT-00481</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <ReqdExctnDt>2026-09-15</ReqdExctnDt>
      <Dbtr>
        <Nm>Apex Logistics LLC</Nm>
      </Dbtr>
      <DbtrAcct>
        <Id><Othr><Id>00114092837</Id></Othr></Id>
      </DbtrAcct>
      <Cdtr>
        <Nm>Meridian Trading FZ-LLC</Nm>
      </Cdtr>
      <CdtrAcct>
        <Id><Othr><Id>88210937461</Id></Othr></Id>
      </CdtrAcct>
      <Amt>
        <InstdAmt Ccy="USD">145000.00</InstdAmt>
      </Amt>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`,
        convertedJson: `{
  "messageId": "MSG-FN-887712",
  "creationDate": "2026-09-15T09:14:28Z",
  "numberOfTx": 1,
  "controlSum": 145000.00,
  "paymentInfo": {
    "paymentId": "PMT-00481",
    "method": "TRF",
    "requestedExecution": "2026-09-15",
    "debtor": { "name": "Apex Logistics LLC", "account": "00114092837" },
    "creditor": { "name": "Meridian Trading FZ-LLC", "account": "88210937461" },
    "instructedAmount": { "value": 145000.00, "currency": "USD" }
  }
}`,
      },
      {
        type: 'Pacs.002',
        messageType: 'FIToFIPaymentStatusReport',
        direction: 'Inbound (Compliance → Middleware)',
        rawPayload: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.002.001.12">
  <FIToFIPmtStsRpt>
    <GrpHdr>
      <MsgId>STS-CO-00481</MsgId>
      <CreDtTm>2026-09-15T09:14:33Z</CreDtTm>
    </GrpHdr>
    <TxInfAndSts>
      <OrgnlEndToEndId>E2E-FN-887712-00481</OrgnlEndToEndId>
      <TxSts>RJCT</TxSts>
      <StsRsnInf>
        <Rsn><Cd>G000</Cd></Rsn>
        <AddtlInf>OFAC sanctions match on creditor name</AddtlInf>
      </StsRsnInf>
    </TxInfAndSts>
  </FIToFIPmtStsRpt>
</Document>`,
        convertedJson: `{
  "messageId": "STS-CO-00481",
  "creationDate": "2026-09-15T09:14:33Z",
  "originalEndToEndId": "E2E-FN-887712-00481",
  "transactionStatus": "RJCT",
  "statusReason": { "code": "G000", "info": "OFAC sanctions match on creditor name" }
}`,
      },
    ],
    interfaceCalls: [
      { id: 'ic1', application: 'Middleware', appKey: 'MW', direction: 'Request', timestamp: '2026-09-15T09:14:29Z', statusCode: 202, latencyMs: 45, endpoint: '/api/v1/payments/submit', payload: '{"msgId":"MSG-FN-887712","amount":145000.00,"ccy":"USD"}', status: 'success' },
      { id: 'ic2', application: 'Fraud Engine', appKey: '1.a', direction: 'Response', timestamp: '2026-09-15T09:14:30Z', statusCode: 200, latencyMs: 120, endpoint: '/fraud/score', payload: '{"riskScore":34,"decision":"ACCEPT","model":"v3.2"}', status: 'success' },
      { id: 'ic3', application: 'Compliance', appKey: '1.b', direction: 'Response', timestamp: '2026-09-15T09:14:32Z', statusCode: 403, latencyMs: 890, endpoint: '/compliance/screen', payload: '{"decision":"REJECT","matchScore":0.91,"list":"OFAC_SDN","matchedEntity":"Meridian Trading FZ-LLC"}', status: 'failed' },
      { id: 'ic4', application: 'Core Banking', appKey: '1.c', direction: 'Request', timestamp: '2026-09-15T09:14:32Z', statusCode: 0, latencyMs: 0, endpoint: '/core/postDebit', payload: '{"status":"SKIPPED","reason":"Compliance rejection"}', status: 'pending' },
      { id: 'ic5', application: 'Advices', appKey: '1.d', direction: 'Request', timestamp: '2026-09-15T09:14:33Z', statusCode: 202, latencyMs: 38, endpoint: '/advices/reject', payload: '{"type":"REJECTION_ADVICE","txnId":"TXN-20260915-00481"}', status: 'success' },
    ],
    logs: [
      { id: 'l1', timestamp: '2026-09-15T09:14:29Z', level: 'INFO', source: 'Middleware', message: 'Pain.001 received and validated for TXN-20260915-00481' },
      { id: 'l2', timestamp: '2026-09-15T09:14:30Z', level: 'INFO', source: 'Fraud', message: 'Risk scoring complete: score=34, decision=ACCEPT' },
      { id: 'l3', timestamp: '2026-09-15T09:14:31Z', level: 'INFO', source: 'Compliance', message: 'Sanctions screening initiated for creditor Meridian Trading FZ-LLC' },
      { id: 'l4', timestamp: '2026-09-15T09:14:32Z', level: 'WARN', source: 'Compliance', message: 'OFAC SDN list match detected, matchScore=0.91' },
      { id: 'l5', timestamp: '2026-09-15T09:14:32Z', level: 'ERROR', source: 'Compliance', message: 'Compliance decision: REJECT. Generating Pacs.002 status report with reason G000' },
      { id: 'l6', timestamp: '2026-09-15T09:14:32Z', level: 'ERROR', source: 'Payment Processor', message: 'Payment TXN-20260915-00481 rejected due to compliance hold. Halting downstream processing.' },
      { id: 'l7', timestamp: '2026-09-15T09:14:33Z', level: 'INFO', source: 'Advices', message: 'Rejection advice dispatched to debtor channel' },
    ],
    aiTriage: {
      failureReason: 'Payment rejected due to OFAC sanctions screening match on the creditor entity "Meridian Trading FZ-LLC" with a 0.91 match confidence score.',
      rootCauseApplication: 'Compliance Screening Service',
      rootCauseNode: 'co',
      rawErrorCode: 'CMP_OFC_4031',
      iso20022Code: 'G000',
      iso20022Description: 'Regulatory reason — Sanctions screening rejection',
      knowledgeBaseRef: 'KB-PAY-3401',
      knowledgeBaseTitle: 'OFAC Sanctions Match — Compliance Rejection Handling',
      knowledgeBaseSnippet: 'When the Compliance service returns a 403 with CMP_OFC_4031, the payment is automatically rejected and a Pacs.002 status report is generated. Ops should verify the match against the SDN list and, if a false positive, escalate to Compliance Tier 2 for manual override. Do NOT auto-retry without compliance clearance.',
      recommendedSteps: [
        { label: 'Review Sanctions Match', action: 'review_match', variant: 'primary' },
        { label: 'Escalate to Compliance Tier 2', action: 'escalate_compliance', variant: 'danger' },
        { label: 'Generate Compliance Report', action: 'gen_report', variant: 'secondary' },
      ],
    },
  },

  // Scenario B: Core Banking Timeout during debit posted on 1.c
  {
    id: 'TXN-20260915-00372',
    endToEndId: 'E2E-ACH-552301-00372',
    debitMOP: 'ACH',
    creditMOP: 'ACH',
    amount: 89500.50,
    currency: 'USD',
    status: 'Failed',
    timestamp: '2026-09-15T08:42:17Z',
    scenario: 'Core Banking Timeout — Debit post failure',
    debtorName: 'Summit Manufacturing Inc.',
    creditorName: 'Pinnacle Components Ltd.',
    debtorAccount: '20045678123',
    creditorAccount: '99887766554',
    flowNodes: [
      { id: 'ch', label: 'Channels', type: 'channel', status: 'success', detail: 'ACH batch file received from treasury portal' },
      { id: 'mw', label: 'Middleware', type: 'middleware', status: 'success', detail: 'Pain.001 validated and transformed' },
      { id: 'pp', label: 'Payment Processor', type: 'processor', status: 'failed', detail: 'Processor received timeout from Core Banking on debit post' },
      { id: 'cl', label: 'Clearing', type: 'clearing', status: 'idle', detail: 'Not triggered — debit not confirmed' },
      { id: 'fr', label: 'Fraud', type: 'fraud', status: 'success', detail: 'Risk score: 18 / 100 — low risk' },
      { id: 'co', label: 'Compliance', type: 'compliance', status: 'success', detail: 'Screening passed, no matches' },
      { id: 'cb', label: 'Core Banking', type: 'corebanking', status: 'failed', detail: 'Timeout (30s) on /core/postDebit — CBS_ERR_4021' },
      { id: 'ad', label: 'Advices', type: 'advices', status: 'idle', detail: 'Not triggered' },
    ],
    isoMessages: [
      {
        type: 'Pain.001',
        messageType: 'CustomerCreditTransferInitiation',
        direction: 'Outbound (Channels → Middleware)',
        rawPayload: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>MSG-ACH-552301</MsgId>
      <CreDtTm>2026-09-15T08:42:10Z</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PMT-00372</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <Dbtr><Nm>Summit Manufacturing Inc.</Nm></Dbtr>
      <DbtrAcct><Id><Othr><Id>20045678123</Id></Othr></Id></DbtrAcct>
      <Cdtr><Nm>Pinnacle Components Ltd.</Nm></Cdtr>
      <CdtrAcct><Id><Othr><Id>99887766554</Id></Othr></Id></CdtrAcct>
      <Amt><InstdAmt Ccy="USD">89500.50</InstdAmt></Amt>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`,
        convertedJson: `{
  "messageId": "MSG-ACH-552301",
  "creationDate": "2026-09-15T08:42:10Z",
  "paymentInfo": {
    "paymentId": "PMT-00372",
    "method": "TRF",
    "debtor": { "name": "Summit Manufacturing Inc.", "account": "20045678123" },
    "creditor": { "name": "Pinnacle Components Ltd.", "account": "99887766554" },
    "instructedAmount": { "value": 89500.50, "currency": "USD" }
  }
}`,
      },
      {
        type: 'Pain.002',
        messageType: 'CustomerPaymentStatusReport',
        direction: 'Outbound (Middleware → Channels)',
        rawPayload: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.002.001.12">
  <CstmrPmtStsRpt>
    <GrpHdr>
      <MsgId>STS-CB-00372</MsgId>
      <CreDtTm>2026-09-15T08:42:51Z</CreDtTm>
    </GrpHdr>
    <OrgnlPmtInfAndSts>
      <OrgnlPmtInfId>PMT-00372</OrgnlPmtInfId>
      <TxInfAndSts>
        <OrgnlEndToEndId>E2E-ACH-552301-00372</OrgnlEndToEndId>
        <TxSts>FAIL</TxSts>
        <StsRsnInf>
          <Rsn><Cd>AM04</Cd></Rsn>
          <AddtlInf>Core Banking debit post timeout — CBS_ERR_4021</AddtlInf>
        </StsRsnInf>
      </TxInfAndSts>
    </OrgnlPmtInfAndSts>
  </CstmrPmtStsRpt>
</Document>`,
        convertedJson: `{
  "messageId": "STS-CB-00372",
  "creationDate": "2026-09-15T08:42:51Z",
  "originalPaymentId": "PMT-00372",
  "originalEndToEndId": "E2E-ACH-552301-00372",
  "transactionStatus": "FAIL",
  "statusReason": { "code": "AM04", "info": "Core Banking debit post timeout — CBS_ERR_4021" }
}`,
      },
    ],
    interfaceCalls: [
      { id: 'ic1', application: 'Middleware', appKey: 'MW', direction: 'Request', timestamp: '2026-09-15T08:42:12Z', statusCode: 202, latencyMs: 52, endpoint: '/api/v1/payments/submit', payload: '{"msgId":"MSG-ACH-552301","amount":89500.50}', status: 'success' },
      { id: 'ic2', application: 'Fraud Engine', appKey: '1.a', direction: 'Response', timestamp: '2026-09-15T08:42:13Z', statusCode: 200, latencyMs: 95, endpoint: '/fraud/score', payload: '{"riskScore":18,"decision":"ACCEPT"}', status: 'success' },
      { id: 'ic3', application: 'Compliance', appKey: '1.b', direction: 'Response', timestamp: '2026-09-15T08:42:14Z', statusCode: 200, latencyMs: 210, endpoint: '/compliance/screen', payload: '{"decision":"PASS","matches":[]}', status: 'success' },
      { id: 'ic4', application: 'Core Banking', appKey: '1.c', direction: 'Request', timestamp: '2026-09-15T08:42:15Z', statusCode: 504, latencyMs: 30000, endpoint: '/core/postDebit', payload: '{"error":"GATEWAY_TIMEOUT","code":"CBS_ERR_4021","detail":"Liquidity check exceeded 30s threshold"}', status: 'failed' },
      { id: 'ic5', application: 'Advices', appKey: '1.d', direction: 'Request', timestamp: '2026-09-15T08:42:51Z', statusCode: 0, latencyMs: 0, endpoint: '/advices/failure', payload: '{"status":"SKIPPED","reason":"Core banking failure"}', status: 'pending' },
    ],
    logs: [
      { id: 'l1', timestamp: '2026-09-15T08:42:12Z', level: 'INFO', source: 'Middleware', message: 'Pain.001 received for TXN-20260915-00372' },
      { id: 'l2', timestamp: '2026-09-15T08:42:13Z', level: 'INFO', source: 'Fraud', message: 'Risk score=18, decision=ACCEPT' },
      { id: 'l3', timestamp: '2026-09-15T08:42:14Z', level: 'INFO', source: 'Compliance', message: 'Sanctions screening passed, 0 matches' },
      { id: 'l4', timestamp: '2026-09-15T08:42:15Z', level: 'INFO', source: 'Core Banking', message: 'Initiating debit post for account 20045678123, amount 89500.50 USD' },
      { id: 'l5', timestamp: '2026-09-15T08:42:45Z', level: 'WARN', source: 'Core Banking', message: 'Debit post latency exceeded 30s threshold. Retrying attempt 1/1...' },
      { id: 'l6', timestamp: '2026-09-15T08:42:51Z', level: 'ERROR', source: 'Core Banking', message: 'CBS_ERR_4021: Liquidity timeout. Debit post failed after 30s.' },
      { id: 'l7', timestamp: '2026-09-15T08:42:51Z', level: 'ERROR', source: 'Payment Processor', message: 'TXN-20260915-00372 failed. Generating Pain.002 status report with AM04.' },
    ],
    aiTriage: {
      failureReason: 'Core Banking System timed out (30s) during the debit posting phase due to a liquidity check exceeding the settlement window threshold.',
      rootCauseApplication: 'Core Banking System',
      rootCauseNode: 'cb',
      rawErrorCode: 'CBS_ERR_4021',
      iso20022Code: 'AM04',
      iso20022Description: 'Insufficient funds — Settlement/liquidity timeout',
      knowledgeBaseRef: 'KB-PAY-8820',
      knowledgeBaseTitle: 'Core Banking Liquidity Timeout — CBS_ERR_4021',
      knowledgeBaseSnippet: 'CBS_ERR_4021 indicates the Core Banking System could not complete the debit posting within the 30s settlement window, typically due to intraday liquidity constraints. The payment should be retried during the next settlement window or escalated to Treasury Ops for liquidity confirmation before retry.',
      recommendedSteps: [
        { label: 'Trigger Manual Re-try', action: 'manual_retry', variant: 'primary' },
        { label: 'Escalate to Ops Tier 2', action: 'escalate_ops', variant: 'danger' },
        { label: 'Check Liquidity Status', action: 'check_liquidity', variant: 'secondary' },
      ],
    },
  },

  // Scenario C: Clearing Return (Pacs.004 triggered due to closed account)
  {
    id: 'TXN-20260915-00256',
    endToEndId: 'E2E-SEP-119083-00256',
    debitMOP: 'SEPA',
    creditMOP: 'SEPA',
    amount: 32400.75,
    currency: 'EUR',
    status: 'Returned',
    timestamp: '2026-09-15T07:21:44Z',
    scenario: 'Clearing Return — Creditor account closed',
    debtorName: 'Nordic Supplies AB',
    creditorName: 'Iberia Textiles S.A.',
    debtorAccount: 'SE4550000000058398257466',
    creditorAccount: 'ES9121000418450200051332',
    flowNodes: [
      { id: 'ch', label: 'Channels', type: 'channel', status: 'success', detail: 'SEPA CT received via SWIFT interface' },
      { id: 'mw', label: 'Middleware', type: 'middleware', status: 'success', detail: 'Pain.001 validated, Pacs.008 generated' },
      { id: 'pp', label: 'Payment Processor', type: 'processor', status: 'success', detail: 'Processor forwarded Pacs.008 to clearing' },
      { id: 'cl', label: 'Clearing', type: 'clearing', status: 'failed', detail: 'Pacs.008 sent, Pacs.004 return received — account closed' },
      { id: 'fr', label: 'Fraud', type: 'fraud', status: 'success', detail: 'Risk score: 22 / 100 — low risk' },
      { id: 'co', label: 'Compliance', type: 'compliance', status: 'success', detail: 'Screening passed' },
      { id: 'cb', label: 'Core Banking', type: 'corebanking', status: 'success', detail: 'Debit posted successfully' },
      { id: 'ad', label: 'Advices', type: 'advices', status: 'active', detail: 'Processing return advice (Camt.054)' },
    ],
    isoMessages: [
      {
        type: 'Pacs.008',
        messageType: 'FIToFICustomerCreditTransfer',
        direction: 'Outbound (Processor → Clearing)',
        rawPayload: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>MSG-SEP-119083</MsgId>
      <CreDtTm>2026-09-15T07:21:35Z</CreDtTm>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>E2E-SEP-119083-00256</EndToEndId>
        <TxId>TXN-20260915-00256</TxId>
      </PmtId>
      <Amt><InstdAmt Ccy="EUR">32400.75</InstdAmt></Amt>
      <Dbtr><Nm>Nordic Supplies AB</Nm></Dbtr>
      <DbtrAcct><Id><IBAN>SE4550000000058398257466</IBAN></Id></DbtrAcct>
      <Cdtr><Nm>Iberia Textiles S.A.</Nm></Cdtr>
      <CdtrAcct><Id><IBAN>ES9121000418450200051332</IBAN></Id></CdtrAcct>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`,
        convertedJson: `{
  "messageId": "MSG-SEP-119083",
  "creationDate": "2026-09-15T07:21:35Z",
  "creditTransfer": {
    "endToEndId": "E2E-SEP-119083-00256",
    "txId": "TXN-20260915-00256",
    "instructedAmount": { "value": 32400.75, "currency": "EUR" },
    "debtor": { "name": "Nordic Supplies AB", "iban": "SE4550000000058398257466" },
    "creditor": { "name": "Iberia Textiles S.A.", "iban": "ES9121000418450200051332" }
  }
}`,
      },
      {
        type: 'Pacs.004',
        messageType: 'PaymentReturn',
        direction: 'Inbound (Clearing → Processor)',
        rawPayload: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.004.001.11">
  <PmtRtr>
    <GrpHdr>
      <MsgId>RTR-CL-00256</MsgId>
      <CreDtTm>2026-09-15T07:22:10Z</CreDtTm>
    </GrpHdr>
    <TxInf>
      <RtrdEndToEndId>E2E-SEP-119083-00256</RtrdEndToEndId>
      <RtrdInstdAmt Ccy="EUR">32400.75</RtrdInstdAmt>
      <RtrRsnInf>
        <Rsn><Cd>AC06</Cd></Rsn>
        <AddtlInf>Creditor account closed</AddtlInf>
      </RtrRsnInf>
    </TxInf>
  </PmtRtr>
</Document>`,
        convertedJson: `{
  "messageId": "RTR-CL-00256",
  "creationDate": "2026-09-15T07:22:10Z",
  "return": {
    "originalEndToEndId": "E2E-SEP-119083-00256",
    "returnedAmount": { "value": 32400.75, "currency": "EUR" },
    "returnReason": { "code": "AC06", "info": "Creditor account closed" }
  }
}`,
      },
      {
        type: 'Camt.054',
        messageType: 'BankToCustomerDebitCreditReport',
        direction: 'Outbound (Advices → Channels)',
        rawPayload: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.054.001.08">
  <BkToCstmrDbtCdtRpt>
    <GrpHdr>
      <MsgId>ADV-054-00256</MsgId>
      <CreDtTm>2026-09-15T07:22:15Z</CreDtTm>
    </GrpHdr>
    <Rpt>
      <Tx>
        <Ntry>
          <Amt Ccy="EUR">32400.75</Amt>
          <CdtDbtInd>CRDT</CdtDbtInd>
          <AddtlNtryInf>Return of payment — account closed</AddtlNtryInf>
        </Ntry>
      </Tx>
    </Rpt>
  </BkToCstmrDbtCdtRpt>
</Document>`,
        convertedJson: `{
  "messageId": "ADV-054-00256",
  "creationDate": "2026-09-15T07:22:15Z",
  "entry": { "amount": 32400.75, "currency": "EUR", "indicator": "CRDT", "info": "Return of payment — account closed" }
}`,
      },
    ],
    interfaceCalls: [
      { id: 'ic1', application: 'Middleware', appKey: 'MW', direction: 'Request', timestamp: '2026-09-15T07:21:36Z', statusCode: 202, latencyMs: 48, endpoint: '/api/v1/payments/submit', payload: '{"msgId":"MSG-SEP-119083","amount":32400.75,"ccy":"EUR"}', status: 'success' },
      { id: 'ic2', application: 'Fraud Engine', appKey: '1.a', direction: 'Response', timestamp: '2026-09-15T07:21:37Z', statusCode: 200, latencyMs: 88, endpoint: '/fraud/score', payload: '{"riskScore":22,"decision":"ACCEPT"}', status: 'success' },
      { id: 'ic3', application: 'Compliance', appKey: '1.b', direction: 'Response', timestamp: '2026-09-15T07:21:38Z', statusCode: 200, latencyMs: 180, endpoint: '/compliance/screen', payload: '{"decision":"PASS","matches":[]}', status: 'success' },
      { id: 'ic4', application: 'Core Banking', appKey: '1.c', direction: 'Response', timestamp: '2026-09-15T07:21:40Z', statusCode: 200, latencyMs: 340, endpoint: '/core/postDebit', payload: '{"status":"POSTED","debitRef":"DBT-00256"}', status: 'success' },
      { id: 'ic5', application: 'Clearing', appKey: 'CL', direction: 'Response', timestamp: '2026-09-15T07:22:10Z', statusCode: 200, latencyMs: 0, endpoint: '/clearing/pacs004', payload: '{"returnReason":"AC06","detail":"Creditor account closed","amount":32400.75}', status: 'failed' },
      { id: 'ic6', application: 'Advices', appKey: '1.d', direction: 'Request', timestamp: '2026-09-15T07:22:12Z', statusCode: 200, latencyMs: 55, endpoint: '/advices/return', payload: '{"type":"RETURN_ADVICE","camt054":true}', status: 'success' },
    ],
    logs: [
      { id: 'l1', timestamp: '2026-09-15T07:21:36Z', level: 'INFO', source: 'Middleware', message: 'Pain.001 received, generating Pacs.008 for SEPA clearing' },
      { id: 'l2', timestamp: '2026-09-15T07:21:37Z', level: 'INFO', source: 'Fraud', message: 'Risk score=22, decision=ACCEPT' },
      { id: 'l3', timestamp: '2026-09-15T07:21:38Z', level: 'INFO', source: 'Compliance', message: 'Screening passed' },
      { id: 'l4', timestamp: '2026-09-15T07:21:40Z', level: 'INFO', source: 'Core Banking', message: 'Debit posted to 20045678123, ref DBT-00256' },
      { id: 'l5', timestamp: '2026-09-15T07:22:10Z', level: 'WARN', source: 'Clearing', message: 'Pacs.004 return received from SEPA clearer. Reason: AC06 (account closed)' },
      { id: 'l6', timestamp: '2026-09-15T07:22:11Z', level: 'ERROR', source: 'Payment Processor', message: 'Payment returned by clearer. Initiating return processing and credit reversal.' },
      { id: 'l7', timestamp: '2026-09-15T07:22:12Z', level: 'INFO', source: 'Advices', message: 'Camt.054 return advice generated and sent to debtor channel' },
    ],
    aiTriage: {
      failureReason: 'Payment was returned by the SEPA clearing infrastructure because the creditor account (ES9121000418450200051332) is closed. The debit was successfully posted but the credit could not be delivered.',
      rootCauseApplication: 'Clearing Infrastructure (SEPA)',
      rootCauseNode: 'cl',
      rawErrorCode: 'CLR_RET_AC06',
      iso20022Code: 'AC06',
      iso20022Description: 'Account closed — Creditor account is not active',
      knowledgeBaseRef: 'KB-PAY-5510',
      knowledgeBaseTitle: 'SEPA Clearing Return (AC06) — Closed Creditor Account',
      knowledgeBaseSnippet: 'AC06 indicates the creditor bank rejected the credit because the account is closed. The debit has already been posted, so Ops must process the return: reverse the debit via Core Banking, generate a Camt.054 advice, and notify the debtor. The creditor should be contacted to provide valid account details.',
      recommendedSteps: [
        { label: 'Process Return & Reverse Debit', action: 'process_return', variant: 'primary' },
        { label: 'Generate Camt.054 Advice', action: 'gen_advice', variant: 'secondary' },
        { label: 'Notify Debtor Channel', action: 'notify_debtor', variant: 'secondary' },
      ],
    },
  },

  // Scenario D: Cancellation process initiated (Camt.56 sent, awaiting Camt.29)
  {
    id: 'TXN-20260915-00198',
    endToEndId: 'E2E-SW-773204-00198',
    debitMOP: 'SWIFT',
    creditMOP: 'SWIFT',
    amount: 275000.0,
    currency: 'USD',
    status: 'Cancelled',
    timestamp: '2026-09-15T06:55:03Z',
    scenario: 'Cancellation Initiated — Camt.56 sent, awaiting Camt.29',
    debtorName: 'Global Freight Partners',
    creditorName: 'Continental Shipping Ltd.',
    debtorAccount: 'GB29NWBK60161331926819',
    creditorAccount: 'GB29NWBK60161399887766',
    flowNodes: [
      { id: 'ch', label: 'Channels', type: 'channel', status: 'success', detail: 'SWIFT MT103 submitted via treasury workstation' },
      { id: 'mw', label: 'Middleware', type: 'middleware', status: 'success', detail: 'Pain.001 validated, Pacs.008 forwarded' },
      { id: 'pp', label: 'Payment Processor', type: 'processor', status: 'active', detail: 'Cancellation request received, Camt.56 dispatched' },
      { id: 'cl', label: 'Clearing', type: 'clearing', status: 'active', detail: 'Awaiting Camt.29 response from correspondent bank' },
      { id: 'fr', label: 'Fraud', type: 'fraud', status: 'success', detail: 'Risk score: 41 / 100 — within threshold' },
      { id: 'co', label: 'Compliance', type: 'compliance', status: 'success', detail: 'Screening passed' },
      { id: 'cb', label: 'Core Banking', type: 'corebanking', status: 'success', detail: 'Debit posted; pending cancellation confirmation' },
      { id: 'ad', label: 'Advices', type: 'advices', status: 'active', detail: 'Pending Camt.029 to generate cancellation advice' },
    ],
    isoMessages: [
      {
        type: 'Pacs.008',
        messageType: 'FIToFICustomerCreditTransfer',
        direction: 'Outbound (Processor → Clearing)',
        rawPayload: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>MSG-SW-773204</MsgId>
      <CreDtTm>2026-09-15T06:54:55Z</CreDtTm>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>E2E-SW-773204-00198</EndToEndId>
        <TxId>TXN-20260915-00198</TxId>
      </PmtId>
      <Amt><InstdAmt Ccy="USD">275000.00</InstdAmt></Amt>
      <Dbtr><Nm>Global Freight Partners</Nm></Dbtr>
      <Cdtr><Nm>Continental Shipping Ltd.</Nm></Cdtr>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`,
        convertedJson: `{
  "messageId": "MSG-SW-773204",
  "creationDate": "2026-09-15T06:54:55Z",
  "creditTransfer": {
    "endToEndId": "E2E-SW-773204-00198",
    "txId": "TXN-20260915-00198",
    "instructedAmount": { "value": 275000.00, "currency": "USD" },
    "debtor": { "name": "Global Freight Partners" },
    "creditor": { "name": "Continental Shipping Ltd." }
  }
}`,
      },
      {
        type: 'Camt.056',
        messageType: 'FIToFIPaymentCancellationRequest',
        direction: 'Outbound (Processor → Clearing)',
        rawPayload: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.056.001.09">
  <FIToFPmtCxlReq>
    <GrpHdr>
      <MsgId>CXL-056-00198</MsgId>
      <CreDtTm>2026-09-15T06:55:02Z</CreDtTm>
    </GrpHdr>
    <CxlInf>
      <CxlId>CXL-00198</CxlId>
      <OrgnlEndToEndId>E2E-SW-773204-00198</OrgnlEndToEndId>
      <CxlRsnInf>
        <Rsn><Cd>CUST</Cd></Rsn>
        <AddtlInf>Customer-initiated cancellation request</AddtlInf>
      </CxlRsnInf>
    </CxlInf>
  </FIToFPmtCxlReq>
</Document>`,
        convertedJson: `{
  "messageId": "CXL-056-00198",
  "creationDate": "2026-09-15T06:55:02Z",
  "cancellation": {
    "cancellationId": "CXL-00198",
    "originalEndToEndId": "E2E-SW-773204-00198",
    "reason": { "code": "CUST", "info": "Customer-initiated cancellation request" }
  }
}`,
      },
    ],
    interfaceCalls: [
      { id: 'ic1', application: 'Middleware', appKey: 'MW', direction: 'Request', timestamp: '2026-09-15T06:54:56Z', statusCode: 202, latencyMs: 60, endpoint: '/api/v1/payments/submit', payload: '{"msgId":"MSG-SW-773204","amount":275000.00}', status: 'success' },
      { id: 'ic2', application: 'Fraud Engine', appKey: '1.a', direction: 'Response', timestamp: '2026-09-15T06:54:57Z', statusCode: 200, latencyMs: 110, endpoint: '/fraud/score', payload: '{"riskScore":41,"decision":"ACCEPT"}', status: 'success' },
      { id: 'ic3', application: 'Compliance', appKey: '1.b', direction: 'Response', timestamp: '2026-09-15T06:54:58Z', statusCode: 200, latencyMs: 250, endpoint: '/compliance/screen', payload: '{"decision":"PASS","matches":[]}', status: 'success' },
      { id: 'ic4', application: 'Core Banking', appKey: '1.c', direction: 'Response', timestamp: '2026-09-15T06:55:00Z', statusCode: 200, latencyMs: 420, endpoint: '/core/postDebit', payload: '{"status":"POSTED","debitRef":"DBT-00198"}', status: 'success' },
      { id: 'ic5', application: 'Clearing', appKey: 'CL', direction: 'Request', timestamp: '2026-09-15T06:55:02Z', statusCode: 202, latencyMs: 75, endpoint: '/clearing/camt056', payload: '{"cxlId":"CXL-00198","reason":"CUST","status":"ACCEPTED_FOR_PROCESSING"}', status: 'pending' },
      { id: 'ic6', application: 'Advices', appKey: '1.d', direction: 'Request', timestamp: '2026-09-15T06:55:03Z', statusCode: 0, latencyMs: 0, endpoint: '/advices/cancellation', payload: '{"status":"WAITING","reason":"Awaiting Camt.029 response"}', status: 'pending' },
    ],
    logs: [
      { id: 'l1', timestamp: '2026-09-15T06:54:56Z', level: 'INFO', source: 'Middleware', message: 'Pain.001 received for TXN-20260915-00198' },
      { id: 'l2', timestamp: '2026-09-15T06:54:57Z', level: 'INFO', source: 'Fraud', message: 'Risk score=41, decision=ACCEPT' },
      { id: 'l3', timestamp: '2026-09-15T06:54:58Z', level: 'INFO', source: 'Compliance', message: 'Screening passed' },
      { id: 'l4', timestamp: '2026-09-15T06:55:00Z', level: 'INFO', source: 'Core Banking', message: 'Debit posted, ref DBT-00198' },
      { id: 'l5', timestamp: '2026-09-15T06:55:01Z', level: 'INFO', source: 'Channels', message: 'Cancellation request received from customer for E2E-SW-773204-00198' },
      { id: 'l6', timestamp: '2026-09-15T06:55:02Z', level: 'WARN', source: 'Payment Processor', message: 'Camt.056 cancellation request dispatched to clearing. Awaiting Camt.029 response.' },
      { id: 'l7', timestamp: '2026-09-15T06:55:03Z', level: 'WARN', source: 'Advices', message: 'Cancellation advice on hold — waiting for Camt.029 confirmation from correspondent bank' },
    ],
    aiTriage: {
      failureReason: 'Customer-initiated cancellation request is in progress. A Camt.056 cancellation request has been sent to the correspondent bank, and the system is awaiting a Camt.029 response to confirm whether the payment can be cancelled before settlement.',
      rootCauseApplication: 'Clearing Infrastructure (SWIFT)',
      rootCauseNode: 'cl',
      rawErrorCode: 'CXL_PENDING_056',
      iso20022Code: 'CUST',
      iso20022Description: 'Customer request — Cancellation initiated by customer',
      knowledgeBaseRef: 'KB-PAY-7730',
      knowledgeBaseTitle: 'SWIFT Cancellation Flow — Camt.056 / Camt.029',
      knowledgeBaseSnippet: 'When a customer requests cancellation, a Camt.056 message is sent to the correspondent bank. The response (Camt.029) determines whether the payment can be stopped. If the payment has already settled, the cancellation will be rejected and a return (Pacs.004) must be initiated instead. Ops should monitor for the Camt.029 within 2 hours.',
      recommendedSteps: [
        { label: 'Monitor Camt.029 Response', action: 'monitor_camt029', variant: 'primary' },
        { label: 'Initiate Pacs.004 Return if Settled', action: 'initiate_return', variant: 'secondary' },
        { label: 'Escalate to Ops Tier 2', action: 'escalate_ops', variant: 'danger' },
      ],
    },
  },

  // Scenario E: Completed transaction (for comparison)
  {
    id: 'TXN-20260915-00101',
    endToEndId: 'E2E-FN-554201-00101',
    debitMOP: 'FedNow',
    creditMOP: 'FedNow',
    amount: 15000.0,
    currency: 'USD',
    status: 'Completed',
    timestamp: '2026-09-15T05:33:12Z',
    scenario: 'Completed — Successful FedNow payment',
    debtorName: 'Riverside Cafe Group',
    creditorName: 'Green Valley Supplies',
    debtorAccount: '00112345678',
    creditorAccount: '00198765432',
    flowNodes: successFlow,
    isoMessages: [
      {
        type: 'Pain.001',
        messageType: 'CustomerCreditTransferInitiation',
        direction: 'Outbound (Channels → Middleware)',
        rawPayload: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>MSG-FN-554201</MsgId>
      <CreDtTm>2026-09-15T05:33:05Z</CreDtTm>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PMT-00101</PmtInfId>
      <Dbtr><Nm>Riverside Cafe Group</Nm></Dbtr>
      <Cdtr><Nm>Green Valley Supplies</Nm></Cdtr>
      <Amt><InstdAmt Ccy="USD">15000.00</InstdAmt></Amt>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`,
        convertedJson: `{
  "messageId": "MSG-FN-554201",
  "creationDate": "2026-09-15T05:33:05Z",
  "paymentInfo": {
    "paymentId": "PMT-00101",
    "debtor": { "name": "Riverside Cafe Group" },
    "creditor": { "name": "Green Valley Supplies" },
    "instructedAmount": { "value": 15000.00, "currency": "USD" }
  }
}`,
      },
      {
        type: 'Pacs.008',
        messageType: 'FIToFICustomerCreditTransfer',
        direction: 'Outbound (Processor → Clearing)',
        rawPayload: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10">
  <FIToFICstmrCdtTrf>
    <GrpHdr><MsgId>MSG-FN-554201-OUT</MsgId><CreDtTm>2026-09-15T05:33:08Z</CreDtTm></GrpHdr>
    <CdtTrfTxInf>
      <PmtId><EndToEndId>E2E-FN-554201-00101</EndToEndId></PmtId>
      <Amt><InstdAmt Ccy="USD">15000.00</InstdAmt></Amt>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`,
        convertedJson: `{
  "messageId": "MSG-FN-554201-OUT",
  "creationDate": "2026-09-15T05:33:08Z",
  "creditTransfer": {
    "endToEndId": "E2E-FN-554201-00101",
    "instructedAmount": { "value": 15000.00, "currency": "USD" }
  }
}`,
      },
      {
        type: 'Camt.054',
        messageType: 'BankToCustomerDebitCreditReport',
        direction: 'Outbound (Advices → Channels)',
        rawPayload: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.054.001.08">
  <BkToCstmrDbtCdtRpt>
    <GrpHdr><MsgId>ADV-054-00101</MsgId><CreDtTm>2026-09-15T05:33:15Z</CreDtTm></GrpHdr>
    <Rpt>
      <Tx>
        <Ntry>
          <Amt Ccy="USD">15000.00</Amt>
          <CdtDbtInd>DBIT</CdtDbtInd>
        </Ntry>
      </Tx>
    </Rpt>
  </BkToCstmrDbtCdtRpt>
</Document>`,
        convertedJson: `{
  "messageId": "ADV-054-00101",
  "creationDate": "2026-09-15T05:33:15Z",
  "entry": { "amount": 15000.00, "currency": "USD", "indicator": "DBIT" }
}`,
      },
    ],
    interfaceCalls: [
      { id: 'ic1', application: 'Middleware', appKey: 'MW', direction: 'Request', timestamp: '2026-09-15T05:33:06Z', statusCode: 202, latencyMs: 42, endpoint: '/api/v1/payments/submit', payload: '{"msgId":"MSG-FN-554201","amount":15000.00}', status: 'success' },
      { id: 'ic2', application: 'Fraud Engine', appKey: '1.a', direction: 'Response', timestamp: '2026-09-15T05:33:07Z', statusCode: 200, latencyMs: 85, endpoint: '/fraud/score', payload: '{"riskScore":8,"decision":"ACCEPT"}', status: 'success' },
      { id: 'ic3', application: 'Compliance', appKey: '1.b', direction: 'Response', timestamp: '2026-09-15T05:33:08Z', statusCode: 200, latencyMs: 150, endpoint: '/compliance/screen', payload: '{"decision":"PASS","matches":[]}', status: 'success' },
      { id: 'ic4', application: 'Core Banking', appKey: '1.c', direction: 'Response', timestamp: '2026-09-15T05:33:10Z', statusCode: 200, latencyMs: 280, endpoint: '/core/postDebit', payload: '{"status":"POSTED","debitRef":"DBT-00101"}', status: 'success' },
      { id: 'ic5', application: 'Clearing', appKey: 'CL', direction: 'Response', timestamp: '2026-09-15T05:33:14Z', statusCode: 200, latencyMs: 3200, endpoint: '/clearing/pacs008', payload: '{"status":"SETTLED","settlementRef":"STL-00101"}', status: 'success' },
      { id: 'ic6', application: 'Advices', appKey: '1.d', direction: 'Request', timestamp: '2026-09-15T05:33:15Z', statusCode: 200, latencyMs: 50, endpoint: '/advices/debit', payload: '{"type":"DEBIT_ADVICE","camt054":true}', status: 'success' },
    ],
    logs: [
      { id: 'l1', timestamp: '2026-09-15T05:33:06Z', level: 'INFO', source: 'Middleware', message: 'Pain.001 received for TXN-20260915-00101' },
      { id: 'l2', timestamp: '2026-09-15T05:33:07Z', level: 'INFO', source: 'Fraud', message: 'Risk score=8, decision=ACCEPT' },
      { id: 'l3', timestamp: '2026-09-15T05:33:08Z', level: 'INFO', source: 'Compliance', message: 'Screening passed' },
      { id: 'l4', timestamp: '2026-09-15T05:33:10Z', level: 'INFO', source: 'Core Banking', message: 'Debit posted, ref DBT-00101' },
      { id: 'l5', timestamp: '2026-09-15T05:33:14Z', level: 'INFO', source: 'Clearing', message: 'Pacs.008 settled. Settlement ref STL-00101' },
      { id: 'l6', timestamp: '2026-09-15T05:33:15Z', level: 'INFO', source: 'Advices', message: 'Camt.054 debit advice sent to channel' },
    ],
    aiTriage: {
      failureReason: 'No failure detected. Payment completed successfully through all stages of the lifecycle.',
      rootCauseApplication: 'N/A',
      rootCauseNode: '',
      rawErrorCode: 'N/A',
      iso20022Code: 'N/A',
      iso20022Description: 'No errors',
      knowledgeBaseRef: 'KB-PAY-0000',
      knowledgeBaseTitle: 'Successful Payment Reference',
      knowledgeBaseSnippet: 'This transaction completed successfully with no anomalies. All nodes passed, clearing settled, and advices were generated.',
      recommendedSteps: [
        { label: 'View Transaction Details', action: 'view_details', variant: 'secondary' },
        { label: 'Download Advice', action: 'download_advice', variant: 'secondary' },
      ],
    },
  },

  // Scenario F: Fraud rejection
  {
    id: 'TXN-20260915-00534',
    endToEndId: 'E2E-RT-441209-00534',
    debitMOP: 'RTGS',
    creditMOP: 'RTGS',
    amount: 950000.0,
    currency: 'USD',
    status: 'Rejected',
    timestamp: '2026-09-15T10:22:48Z',
    scenario: 'Fraud Rejection — High risk score threshold breach',
    debtorName: 'Quantum Holdings Corp',
    creditorName: 'Offshore Ventures Ltd.',
    debtorAccount: '00145678901',
    creditorAccount: '00199883344',
    flowNodes: [
      { id: 'ch', label: 'Channels', type: 'channel', status: 'success', detail: 'RTGS payment initiated via corporate banking portal' },
      { id: 'mw', label: 'Middleware', type: 'middleware', status: 'success', detail: 'Pain.001 validated and enriched' },
      { id: 'pp', label: 'Payment Processor', type: 'processor', status: 'failed', detail: 'Processor halted on fraud decision=REJECT' },
      { id: 'cl', label: 'Clearing', type: 'clearing', status: 'idle', detail: 'Not triggered — payment rejected before clearing' },
      { id: 'fr', label: 'Fraud', type: 'fraud', status: 'failed', detail: 'Risk score: 87 / 100 — REJECT. Velocity anomaly + new beneficiary' },
      { id: 'co', label: 'Compliance', type: 'compliance', status: 'idle', detail: 'Not triggered — fraud rejection halted pipeline' },
      { id: 'cb', label: 'Core Banking', type: 'corebanking', status: 'idle', detail: 'Not triggered' },
      { id: 'ad', label: 'Advices', type: 'advices', status: 'idle', detail: 'Not triggered' },
    ],
    isoMessages: [
      {
        type: 'Pain.001',
        messageType: 'CustomerCreditTransferInitiation',
        direction: 'Outbound (Channels → Middleware)',
        rawPayload: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>MSG-RT-441209</MsgId>
      <CreDtTm>2026-09-15T10:22:40Z</CreDtTm>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PMT-00534</PmtInfId>
      <Dbtr><Nm>Quantum Holdings Corp</Nm></Dbtr>
      <Cdtr><Nm>Offshore Ventures Ltd.</Nm></Cdtr>
      <Amt><InstdAmt Ccy="USD">950000.00</InstdAmt></Amt>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`,
        convertedJson: `{
  "messageId": "MSG-RT-441209",
  "creationDate": "2026-09-15T10:22:40Z",
  "paymentInfo": {
    "paymentId": "PMT-00534",
    "debtor": { "name": "Quantum Holdings Corp" },
    "creditor": { "name": "Offshore Ventures Ltd." },
    "instructedAmount": { "value": 950000.00, "currency": "USD" }
  }
}`,
      },
      {
        type: 'Pain.002',
        messageType: 'CustomerPaymentStatusReport',
        direction: 'Outbound (Middleware → Channels)',
        rawPayload: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.002.001.12">
  <CstmrPmtStsRpt>
    <GrpHdr>
      <MsgId>STS-FR-00534</MsgId>
      <CreDtTm>2026-09-15T10:22:49Z</CreDtTm>
    </GrpHdr>
    <OrgnlPmtInfAndSts>
      <OrgnlPmtInfId>PMT-00534</OrgnlPmtInfId>
      <TxInfAndSts>
        <OrgnlEndToEndId>E2E-RT-441209-00534</OrgnlEndToEndId>
        <TxSts>RJCT</TxSts>
        <StsRsnInf>
          <Rsn><Cd>FRAD</Cd></Rsn>
          <AddtlInf>Fraud risk score exceeded threshold (87 > 75)</AddtlInf>
        </StsRsnInf>
      </TxInfAndSts>
    </OrgnlPmtInfAndSts>
  </CstmrPmtStsRpt>
</Document>`,
        convertedJson: `{
  "messageId": "STS-FR-00534",
  "creationDate": "2026-09-15T10:22:49Z",
  "originalPaymentId": "PMT-00534",
  "originalEndToEndId": "E2E-RT-441209-00534",
  "transactionStatus": "RJCT",
  "statusReason": { "code": "FRAD", "info": "Fraud risk score exceeded threshold (87 > 75)" }
}`,
      },
    ],
    interfaceCalls: [
      { id: 'ic1', application: 'Middleware', appKey: 'MW', direction: 'Request', timestamp: '2026-09-15T10:22:41Z', statusCode: 202, latencyMs: 50, endpoint: '/api/v1/payments/submit', payload: '{"msgId":"MSG-RT-441209","amount":950000.00}', status: 'success' },
      { id: 'ic2', application: 'Fraud Engine', appKey: '1.a', direction: 'Response', timestamp: '2026-09-15T10:22:43Z', statusCode: 403, latencyMs: 180, endpoint: '/fraud/score', payload: '{"riskScore":87,"decision":"REJECT","reasons":["VELOCITY_ANOMALY","NEW_BENEFICIARY","HIGH_AMOUNT"],"model":"v3.2"}', status: 'failed' },
      { id: 'ic3', application: 'Compliance', appKey: '1.b', direction: 'Request', timestamp: '2026-09-15T10:22:43Z', statusCode: 0, latencyMs: 0, endpoint: '/compliance/screen', payload: '{"status":"SKIPPED","reason":"Fraud rejection"}', status: 'pending' },
      { id: 'ic4', application: 'Core Banking', appKey: '1.c', direction: 'Request', timestamp: '2026-09-15T10:22:43Z', statusCode: 0, latencyMs: 0, endpoint: '/core/postDebit', payload: '{"status":"SKIPPED","reason":"Fraud rejection"}', status: 'pending' },
    ],
    logs: [
      { id: 'l1', timestamp: '2026-09-15T10:22:41Z', level: 'INFO', source: 'Middleware', message: 'Pain.001 received for TXN-20260915-00534' },
      { id: 'l2', timestamp: '2026-09-15T10:22:42Z', level: 'INFO', source: 'Fraud', message: 'Scoring initiated: amount=950000, debtor=Quantum Holdings Corp, creditor=Offshore Ventures Ltd.' },
      { id: 'l3', timestamp: '2026-09-15T10:22:43Z', level: 'WARN', source: 'Fraud', message: 'Velocity anomaly detected: 6 transactions > 500K in 1 hour' },
      { id: 'l4', timestamp: '2026-09-15T10:22:43Z', level: 'ERROR', source: 'Fraud', message: 'Risk score=87 exceeds threshold 75. Decision=REJECT. Reason codes: VELOCITY_ANOMALY, NEW_BENEFICIARY, HIGH_AMOUNT' },
      { id: 'l5', timestamp: '2026-09-15T10:22:43Z', level: 'ERROR', source: 'Payment Processor', message: 'TXN-20260915-00534 rejected by fraud engine. Generating Pain.002 with reason FRAD.' },
    ],
    aiTriage: {
      failureReason: 'Payment was rejected by the Fraud Engine due to a risk score of 87 (threshold: 75). Multiple risk factors triggered: velocity anomaly (6 transactions over $500K in one hour), new beneficiary, and unusually high amount.',
      rootCauseApplication: 'Fraud Detection Engine',
      rootCauseNode: 'fr',
      rawErrorCode: 'FRD_REJ_0087',
      iso20022Code: 'FRAD',
      iso20022Description: 'Transaction rejected due to fraud detection',
      knowledgeBaseRef: 'KB-PAY-9912',
      knowledgeBaseTitle: 'Fraud Engine Rejection — High Risk Score Handling',
      knowledgeBaseSnippet: 'When the Fraud Engine returns a 403 with FRD_REJ_0087, the payment is auto-rejected and a Pain.002 is generated with reason FRAD. Ops should review the risk factors. If the transaction is legitimate (false positive), escalate to Fraud Ops for manual override and re-initiation with a whitelist flag.',
      recommendedSteps: [
        { label: 'Review Risk Factors', action: 'review_fraud', variant: 'primary' },
        { label: 'Escalate to Fraud Ops', action: 'escalate_fraud', variant: 'danger' },
        { label: 'Whitelist Beneficiary', action: 'whitelist', variant: 'secondary' },
      ],
    },
  },

  // Scenario G: ACH Returned - NSF (Insufficient Funds)
  {
    id: 'TXN-20260914-00967',
    endToEndId: 'E2E-ACH-663401-00967',
    debitMOP: 'ACH',
    creditMOP: 'ACH',
    amount: 42750.25,
    currency: 'USD',
    status: 'Returned',
    timestamp: '2026-09-14T16:11:55Z',
    scenario: 'ACH Return — Insufficient funds (R01)',
    debtorName: 'Blue Ocean Trading',
    creditorName: 'Sunrise Materials Co.',
    debtorAccount: '20011223344',
    creditorAccount: '20055667788',
    flowNodes: [
      { id: 'ch', label: 'Channels', type: 'channel', status: 'success', detail: 'ACH payment submitted via online banking' },
      { id: 'mw', label: 'Middleware', type: 'middleware', status: 'success', detail: 'Pain.001 validated' },
      { id: 'pp', label: 'Payment Processor', type: 'processor', status: 'success', detail: 'Payment forwarded to clearing' },
      { id: 'cl', label: 'Clearing', type: 'clearing', status: 'failed', detail: 'ACH return R01 received — insufficient funds' },
      { id: 'fr', label: 'Fraud', type: 'fraud', status: 'success', detail: 'Risk score: 15 / 100 — low risk' },
      { id: 'co', label: 'Compliance', type: 'compliance', status: 'success', detail: 'Screening passed' },
      { id: 'cb', label: 'Core Banking', type: 'corebanking', status: 'success', detail: 'Debit posted; return reversal pending' },
      { id: 'ad', label: 'Advices', type: 'advices', status: 'active', detail: 'Processing return advice' },
    ],
    isoMessages: [
      {
        type: 'Pain.001',
        messageType: 'CustomerCreditTransferInitiation',
        direction: 'Outbound (Channels → Middleware)',
        rawPayload: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>MSG-ACH-663401</MsgId>
      <CreDtTm>2026-09-14T16:11:40Z</CreDtTm>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PMT-00967</PmtInfId>
      <Dbtr><Nm>Blue Ocean Trading</Nm></Dbtr>
      <Cdtr><Nm>Sunrise Materials Co.</Nm></Cdtr>
      <Amt><InstdAmt Ccy="USD">42750.25</InstdAmt></Amt>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`,
        convertedJson: `{
  "messageId": "MSG-ACH-663401",
  "creationDate": "2026-09-14T16:11:40Z",
  "paymentInfo": {
    "paymentId": "PMT-00967",
    "debtor": { "name": "Blue Ocean Trading" },
    "creditor": { "name": "Sunrise Materials Co." },
    "instructedAmount": { "value": 42750.25, "currency": "USD" }
  }
}`,
      },
      {
        type: 'Pacs.004',
        messageType: 'PaymentReturn',
        direction: 'Inbound (Clearing → Processor)',
        rawPayload: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.004.001.11">
  <PmtRtr>
    <GrpHdr>
      <MsgId>RTR-ACH-00967</MsgId>
      <CreDtTm>2026-09-14T16:12:05Z</CreDtTm>
    </GrpHdr>
    <TxInf>
      <RtrdEndToEndId>E2E-ACH-663401-00967</RtrdEndToEndId>
      <RtrdInstdAmt Ccy="USD">42750.25</RtrdInstdAmt>
      <RtrRsnInf>
        <Rsn><Cd>R01</Cd></Rsn>
        <AddtlInf>Insufficient funds in debtor account</AddtlInf>
      </RtrRsnInf>
    </TxInf>
  </PmtRtr>
</Document>`,
        convertedJson: `{
  "messageId": "RTR-ACH-00967",
  "creationDate": "2026-09-14T16:12:05Z",
  "return": {
    "originalEndToEndId": "E2E-ACH-663401-00967",
    "returnedAmount": { "value": 42750.25, "currency": "USD" },
    "returnReason": { "code": "R01", "info": "Insufficient funds in debtor account" }
  }
}`,
      },
    ],
    interfaceCalls: [
      { id: 'ic1', application: 'Middleware', appKey: 'MW', direction: 'Request', timestamp: '2026-09-14T16:11:41Z', statusCode: 202, latencyMs: 44, endpoint: '/api/v1/payments/submit', payload: '{"msgId":"MSG-ACH-663401","amount":42750.25}', status: 'success' },
      { id: 'ic2', application: 'Fraud Engine', appKey: '1.a', direction: 'Response', timestamp: '2026-09-14T16:11:42Z', statusCode: 200, latencyMs: 90, endpoint: '/fraud/score', payload: '{"riskScore":15,"decision":"ACCEPT"}', status: 'success' },
      { id: 'ic3', application: 'Compliance', appKey: '1.b', direction: 'Response', timestamp: '2026-09-14T16:11:43Z', statusCode: 200, latencyMs: 170, endpoint: '/compliance/screen', payload: '{"decision":"PASS"}', status: 'success' },
      { id: 'ic4', application: 'Core Banking', appKey: '1.c', direction: 'Response', timestamp: '2026-09-14T16:11:45Z', statusCode: 200, latencyMs: 310, endpoint: '/core/postDebit', payload: '{"status":"POSTED","debitRef":"DBT-00967"}', status: 'success' },
      { id: 'ic5', application: 'Clearing', appKey: 'CL', direction: 'Response', timestamp: '2026-09-14T16:12:05Z', statusCode: 200, latencyMs: 0, endpoint: '/clearing/return', payload: '{"returnCode":"R01","detail":"Insufficient funds","amount":42750.25}', status: 'failed' },
      { id: 'ic6', application: 'Advices', appKey: '1.d', direction: 'Request', timestamp: '2026-09-14T16:12:07Z', statusCode: 200, latencyMs: 48, endpoint: '/advices/return', payload: '{"type":"RETURN_ADVICE","rtrCode":"R01"}', status: 'success' },
    ],
    logs: [
      { id: 'l1', timestamp: '2026-09-14T16:11:41Z', level: 'INFO', source: 'Middleware', message: 'Pain.001 received for TXN-20260914-00967' },
      { id: 'l2', timestamp: '2026-09-14T16:11:42Z', level: 'INFO', source: 'Fraud', message: 'Risk score=15, decision=ACCEPT' },
      { id: 'l3', timestamp: '2026-09-14T16:11:43Z', level: 'INFO', source: 'Compliance', message: 'Screening passed' },
      { id: 'l4', timestamp: '2026-09-14T16:11:45Z', level: 'INFO', source: 'Core Banking', message: 'Debit posted, ref DBT-00967' },
      { id: 'l5', timestamp: '2026-09-14T16:12:05Z', level: 'WARN', source: 'Clearing', message: 'ACH return received: R01 (Insufficient funds)' },
      { id: 'l6', timestamp: '2026-09-14T16:12:06Z', level: 'ERROR', source: 'Payment Processor', message: 'Payment returned by ACH network. Initiating debit reversal.' },
      { id: 'l7', timestamp: '2026-09-14T16:12:07Z', level: 'INFO', source: 'Advices', message: 'Return advice generated for debtor' },
    ],
    aiTriage: {
      failureReason: 'ACH payment was returned with reason code R01 (Insufficient Funds). The debtor account did not have sufficient balance at the time of settlement, despite the initial debit post succeeding.',
      rootCauseApplication: 'Clearing Infrastructure (ACH)',
      rootCauseNode: 'cl',
      rawErrorCode: 'ACH_R01',
      iso20022Code: 'AM04',
      iso20022Description: 'Insufficient funds — Debtor account balance too low',
      knowledgeBaseRef: 'KB-PAY-2200',
      knowledgeBaseTitle: 'ACH Return R01 — Insufficient Funds Handling',
      knowledgeBaseSnippet: 'R01 is the most common ACH return code indicating insufficient funds. The debit was posted but the RDFI returned the item. Ops should reverse the debit in Core Banking, notify the debtor, and optionally queue for re-presentment (up to 2 retries within 60 days). Check debtor balance before re-submission.',
      recommendedSteps: [
        { label: 'Reverse Debit & Process Return', action: 'reverse_debit', variant: 'primary' },
        { label: 'Queue for Re-presentment', action: 're_represent', variant: 'secondary' },
        { label: 'Notify Debtor', action: 'notify_debtor', variant: 'secondary' },
      ],
    },
  },

  // Scenario H: SEPA Completed
  {
    id: 'TXN-20260914-00845',
    endToEndId: 'E2E-SEP-220415-00845',
    debitMOP: 'SEPA',
    creditMOP: 'SEPA',
    amount: 12750.0,
    currency: 'EUR',
    status: 'Completed',
    timestamp: '2026-09-14T14:30:22Z',
    scenario: 'Completed — Successful SEPA SCT payment',
    debtorName: 'Alpine Tech GmbH',
    creditorName: 'Danish Furniture A/S',
    debtorAccount: 'DE89370400440532013000',
    creditorAccount: 'DK5000400440116243',
    flowNodes: [
      { id: 'ch', label: 'Channels', type: 'channel', status: 'success', detail: 'SEPA SCT submitted via ERP integration' },
      { id: 'mw', label: 'Middleware', type: 'middleware', status: 'success', detail: 'Pain.001 validated, Pacs.008 generated' },
      { id: 'pp', label: 'Payment Processor', type: 'processor', status: 'success', detail: 'Payment forwarded to SEPA clearing' },
      { id: 'cl', label: 'Clearing', type: 'clearing', status: 'success', detail: 'SCT settled successfully' },
      { id: 'fr', label: 'Fraud', type: 'fraud', status: 'success', detail: 'Risk score: 6 / 100 — minimal risk' },
      { id: 'co', label: 'Compliance', type: 'compliance', status: 'success', detail: 'Screening passed' },
      { id: 'cb', label: 'Core Banking', type: 'corebanking', status: 'success', detail: 'Debit and credit posted' },
      { id: 'ad', label: 'Advices', type: 'advices', status: 'success', detail: 'Camt.054 advice sent' },
    ],
    isoMessages: [
      {
        type: 'Pain.001',
        messageType: 'CustomerCreditTransferInitiation',
        direction: 'Outbound (Channels → Middleware)',
        rawPayload: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">
  <CstmrCdtTrfInitn>
    <GrpHdr><MsgId>MSG-SEP-220415</MsgId><CreDtTm>2026-09-14T14:30:15Z</CreDtTm></GrpHdr>
    <PmtInf>
      <PmtInfId>PMT-00845</PmtInfId>
      <Dbtr><Nm>Alpine Tech GmbH</Nm></Dbtr>
      <Cdtr><Nm>Danish Furniture A/S</Nm></Cdtr>
      <Amt><InstdAmt Ccy="EUR">12750.00</InstdAmt></Amt>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`,
        convertedJson: `{
  "messageId": "MSG-SEP-220415",
  "creationDate": "2026-09-14T14:30:15Z",
  "paymentInfo": {
    "paymentId": "PMT-00845",
    "debtor": { "name": "Alpine Tech GmbH" },
    "creditor": { "name": "Danish Furniture A/S" },
    "instructedAmount": { "value": 12750.00, "currency": "EUR" }
  }
}`,
      },
      {
        type: 'Pacs.008',
        messageType: 'FIToFICustomerCreditTransfer',
        direction: 'Outbound (Processor → Clearing)',
        rawPayload: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10">
  <FIToFICstmrCdtTrf>
    <GrpHdr><MsgId>MSG-SEP-220415-OUT</MsgId><CreDtTm>2026-09-14T14:30:18Z</CreDtTm></GrpHdr>
    <CdtTrfTxInf>
      <PmtId><EndToEndId>E2E-SEP-220415-00845</EndToEndId></PmtId>
      <Amt><InstdAmt Ccy="EUR">12750.00</InstdAmt></Amt>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`,
        convertedJson: `{
  "messageId": "MSG-SEP-220415-OUT",
  "creationDate": "2026-09-14T14:30:18Z",
  "creditTransfer": {
    "endToEndId": "E2E-SEP-220415-00845",
    "instructedAmount": { "value": 12750.00, "currency": "EUR" }
  }
}`,
      },
    ],
    interfaceCalls: [
      { id: 'ic1', application: 'Middleware', appKey: 'MW', direction: 'Request', timestamp: '2026-09-14T14:30:16Z', statusCode: 202, latencyMs: 40, endpoint: '/api/v1/payments/submit', payload: '{"msgId":"MSG-SEP-220415","amount":12750.00}', status: 'success' },
      { id: 'ic2', application: 'Fraud Engine', appKey: '1.a', direction: 'Response', timestamp: '2026-09-14T14:30:17Z', statusCode: 200, latencyMs: 75, endpoint: '/fraud/score', payload: '{"riskScore":6,"decision":"ACCEPT"}', status: 'success' },
      { id: 'ic3', application: 'Compliance', appKey: '1.b', direction: 'Response', timestamp: '2026-09-14T14:30:18Z', statusCode: 200, latencyMs: 130, endpoint: '/compliance/screen', payload: '{"decision":"PASS"}', status: 'success' },
      { id: 'ic4', application: 'Core Banking', appKey: '1.c', direction: 'Response', timestamp: '2026-09-14T14:30:20Z', statusCode: 200, latencyMs: 250, endpoint: '/core/postDebit', payload: '{"status":"POSTED","debitRef":"DBT-00845"}', status: 'success' },
      { id: 'ic5', application: 'Clearing', appKey: 'CL', direction: 'Response', timestamp: '2026-09-14T14:30:22Z', statusCode: 200, latencyMs: 2100, endpoint: '/clearing/pacs008', payload: '{"status":"SETTLED","ref":"STL-00845"}', status: 'success' },
    ],
    logs: [
      { id: 'l1', timestamp: '2026-09-14T14:30:16Z', level: 'INFO', source: 'Middleware', message: 'Pain.001 received for TXN-20260914-00845' },
      { id: 'l2', timestamp: '2026-09-14T14:30:17Z', level: 'INFO', source: 'Fraud', message: 'Risk score=6, decision=ACCEPT' },
      { id: 'l3', timestamp: '2026-09-14T14:30:18Z', level: 'INFO', source: 'Compliance', message: 'Screening passed' },
      { id: 'l4', timestamp: '2026-09-14T14:30:20Z', level: 'INFO', source: 'Core Banking', message: 'Debit posted, ref DBT-00845' },
      { id: 'l5', timestamp: '2026-09-14T14:30:22Z', level: 'INFO', source: 'Clearing', message: 'SEPA SCT settled, ref STL-00845' },
    ],
    aiTriage: {
      failureReason: 'No failure detected. Payment completed successfully through all stages.',
      rootCauseApplication: 'N/A',
      rootCauseNode: '',
      rawErrorCode: 'N/A',
      iso20022Code: 'N/A',
      iso20022Description: 'No errors',
      knowledgeBaseRef: 'KB-PAY-0000',
      knowledgeBaseTitle: 'Successful Payment Reference',
      knowledgeBaseSnippet: 'This transaction completed successfully with no anomalies.',
      recommendedSteps: [
        { label: 'View Transaction Details', action: 'view_details', variant: 'secondary' },
      ],
    },
  },
];

export function getTransactionById(id: string): Transaction | undefined {
  return transactions.find((t) => t.id === id);
}
