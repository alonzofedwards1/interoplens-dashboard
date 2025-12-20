const TechnicalLogs = () => {
    return (
        <div className="bg-black text-green-400 p-4 rounded text-xs font-mono overflow-auto max-h-[400px]">
            <pre>
{`[2025-12-19T09:14:22Z] PD_REQUEST_FAILED
Partner: QHIN-A
Transaction: PatientDiscovery
Reason: CERT_EXPIRED
CertThumbprint: A9:F3:22:BC:91
RequestId: 9f23-abc-8821

[2025-12-19T09:14:23Z] PD_REQUEST_RETRY
Partner: QHIN-A
RetryAttempt: 1
Backoff: 500ms
RequestId: 9f23-abc-8821

[2025-12-19T09:14:24Z] PD_REQUEST_SUCCESS
Partner: QHIN-B
Transaction: PatientDiscovery
Latency: 342ms
CorrelationId: 1c44-ff21

[2025-12-19T09:15:02Z] DOC_QUERY_FAILED
Partner: QHIN-C
Transaction: DocumentQuery
HTTPStatus: 500
SOAPFault: Receiver
FaultCode: XDSRegistryError
RequestId: 77aa-9912

[2025-12-19T09:15:05Z] DOC_QUERY_PARTIAL_SUCCESS
Partner: QHIN-C
DocumentsReturned: 3
DocumentsExpected: 5
MissingMetadata: classCode
Latency: 811ms

[2025-12-19T09:16:11Z] DOC_RETRIEVE_SUCCESS
Partner: QHIN-D
Transaction: DocumentRetrieve
DocumentsRetrieved: 3
Latency: 624ms

[2025-12-19T09:17:44Z] PD_REQUEST_TIMEOUT
Partner: QHIN-E
Transaction: PatientDiscovery
TimeoutThreshold: 3000ms
ObservedLatency: 5124ms
RequestId: 0bb1-992e

[2025-12-19T09:18:01Z] PD_REQUEST_RETRY_EXHAUSTED
Partner: QHIN-E
RetryAttempts: 3
FinalStatus: FAILED
Reason: TIMEOUT

[2025-12-19T09:19:36Z] DOC_QUERY_SUCCESS
Partner: QHIN-B
Transaction: DocumentQuery
DocumentsReturned: 7
Latency: 403ms

[2025-12-19T09:20:12Z] METADATA_VALIDATION_WARNING
Partner: QHIN-F
Transaction: DocumentQuery
Issue: Missing practiceSettingCode
Impact: Non-blocking

[2025-12-19T09:21:55Z] DOC_RETRIEVE_FAILED
Partner: QHIN-F
Transaction: DocumentRetrieve
HTTPStatus: 404
Reason: DocumentNotFound
RequestId: e91c-44dd

[2025-12-19T09:22:18Z] SECURITY_POLICY_VIOLATION
Partner: QHIN-G
Transaction: PatientDiscovery
Policy: MutualTLS
Reason: UntrustedIssuer
CertIssuer: Unknown-CA

[2025-12-19T09:23:47Z] DOC_QUERY_SUCCESS
Partner: QHIN-A
Transaction: DocumentQuery
DocumentsReturned: 2
Latency: 289ms

[2025-12-19T09:24:10Z] SYSTEM_HEALTH_CHECK
Component: Interoplens-Gateway
Status: OK
ActiveConnections: 42

[2025-12-19T09:25:01Z] RATE_LIMIT_WARNING
Partner: QHIN-C
Transaction: DocumentQuery
RequestsPerMinute: 612
Threshold: 500
Action: ThrottlingApplied`}
            </pre>
        </div>
    );
};

export default TechnicalLogs;
