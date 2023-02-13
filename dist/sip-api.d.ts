/**
 * A simple yet powerful API which takes care of SIP signaling and WebRTC media sessions for you.
 * @packageDocumentation
 */


/**
 * A request to confirm a {@link Session} (incoming ACK).
 * @public
 */
export declare class Ack {
    private incomingAckRequest;
    /** @internal */
    constructor(incomingAckRequest: IncomingAckRequest);
    /** Incoming ACK request message. */
    get request(): IncomingRequestMessage;
}

/**
 * Incoming INVITE response received when request is accepted.
 * @public
 */
declare interface AckableIncomingResponseWithSession extends IncomingResponse {
    /** Session associated with outgoing request acceptance. */
    readonly session: Session_2;
    /**
     * Send an ACK to acknowledge this response.
     * @param options - Request options bucket.
     */
    ack(options?: RequestOptions): OutgoingAckRequest;
}

/**
 * Message body.
 * @remarks
 * https://tools.ietf.org/html/rfc3261#section-7.4
 * @public
 */
declare interface Body {
    /**
     * If the Content-Disposition header field is missing, bodies of
     * Content-Type application/sdp imply the disposition "session", while
     * other content types imply "render".
     * https://tools.ietf.org/html/rfc3261#section-13.2.1
     * For backward-compatibility, if the Content-Disposition header field
     * is missing, the server SHOULD assume bodies of Content-Type
     * application/sdp are the disposition "session", while other content
     * types are "render".
     * https://tools.ietf.org/html/rfc3261#section-20.11
     */
    contentDisposition: string;
    /**
     * The Content-Type header field indicates the media type of the
     * message-body sent to the recipient.  The Content-Type header field
     * MUST be present if the body is not empty.  If the body is empty,
     * and a Content-Type header field is present, it indicates that the body
     * of the specific type has zero length (for example, an empty audio file).
     * https://tools.ietf.org/html/rfc3261#section-20.15
     */
    contentType: string;
    /**
     * Requests, including new requests defined in extensions to this
     * specification, MAY contain message bodies unless otherwise noted.
     * The interpretation of the body depends on the request method.
     * For response messages, the request method and the response status
     * code determine the type and interpretation of any message body.  All
     * responses MAY include a body.
     * https://tools.ietf.org/html/rfc3261#section-7.4
     */
    content: string;
}

/**
 * Message body content and type.
 * @public
 */
export declare interface BodyAndContentType {
    /** Message body content. */
    body: string;
    /** Message body content type. */
    contentType: string;
}

/**
 * A request to end a {@link Session} (incoming BYE).
 * @public
 */
export declare class Bye {
    private incomingByeRequest;
    /** @internal */
    constructor(incomingByeRequest: IncomingByeRequest);
    /** Incoming BYE request message. */
    get request(): IncomingRequestMessage;
    /** Accept the request. */
    accept(options?: ResponseOptions): Promise<void>;
    /** Reject the request. */
    reject(options?: ResponseOptions): Promise<void>;
}

/**
 * A request to reject an {@link Invitation} (incoming CANCEL).
 * @public
 */
export declare class Cancel {
    private incomingCancelRequest;
    /** @internal */
    constructor(incomingCancelRequest: IncomingRequestMessage);
    /** Incoming CANCEL request message. */
    get request(): IncomingRequestMessage;
}

/**
 * Client Transaction.
 * @remarks
 * The client transaction provides its functionality through the
 * maintenance of a state machine.
 *
 * The TU communicates with the client transaction through a simple
 * interface.  When the TU wishes to initiate a new transaction, it
 * creates a client transaction and passes it the SIP request to send
 * and an IP address, port, and transport to which to send it.  The
 * client transaction begins execution of its state machine.  Valid
 * responses are passed up to the TU from the client transaction.
 * https://tools.ietf.org/html/rfc3261#section-17.1
 * @public
 */
declare abstract class ClientTransaction extends Transaction {
    private _request;
    protected user: ClientTransactionUser;
    protected constructor(_request: OutgoingRequestMessage, transport: Transport_2, user: ClientTransactionUser, state: TransactionState, loggerCategory: string);
    private static makeId;
    /** The outgoing request the transaction handling. */
    get request(): OutgoingRequestMessage;
    /**
     * A 408 to non-INVITE will always arrive too late to be useful ([3]),
     * The client already has full knowledge of the timeout. The only
     * information this message would convey is whether or not the server
     * believed the transaction timed out. However, with the current design
     * of the NIT, a client cannot do anything with this knowledge. Thus,
     * the 408 is simply wasting network resources and contributes to the
     * response bombardment illustrated in [3].
     * https://tools.ietf.org/html/rfc4320#section-4.1
     */
    protected onRequestTimeout(): void;
    /**
     * Receive incoming responses from the transport which match this transaction.
     * Responses will be delivered to the transaction user as necessary.
     * @param response - The incoming response.
     */
    abstract receiveResponse(response: IncomingResponseMessage): void;
}

declare type ClientTransactionConstructor = new (message: OutgoingRequestMessage, transport: Transport_2, user: ClientTransactionUser) => ClientTransaction;

/**
 * UAC Core Transaction User.
 * @public
 */
declare interface ClientTransactionUser extends TransactionUser {
    /**
     * Callback for request timeout error.
     *
     * When a timeout error is received from the transaction layer, it MUST be
     * treated as if a 408 (Request Timeout) status code has been received.
     * https://tools.ietf.org/html/rfc3261#section-8.1.3.1
     * TU MUST be informed of a timeout.
     * https://tools.ietf.org/html/rfc3261#section-17.1.2.2
     */
    onRequestTimeout?: () => void;
    /**
     * Callback for delegation of valid response handling.
     *
     * Valid responses are passed up to the TU from the client transaction.
     * https://tools.ietf.org/html/rfc3261#section-17.1
     */
    receiveResponse?: (response: IncomingResponseMessage) => void;
}

/**
 * Contact.
 * @remarks
 * https://tools.ietf.org/html/rfc3261#section-8.1.1.8
 * This is ported from UA.contact.
 * FIXME: TODO: This is not a great rep for Contact
 * and is used in a kinda hacky way herein.
 * @public
 */
declare interface Contact {
    pubGruu: URI | undefined;
    tempGruu: URI | undefined;
    uri: URI;
    toString: (options?: {
        anonymous?: boolean;
        outbound?: boolean;
        register?: boolean;
    }) => string;
}

/**
 * An exception indicating an unsupported content type prevented execution.
 * @public
 */
export declare class ContentTypeUnsupportedError extends Exception {
    constructor(message?: string);
}

/**
 * Dialog.
 * @remarks
 * A key concept for a user agent is that of a dialog.  A dialog
 * represents a peer-to-peer SIP relationship between two user agents
 * that persists for some time.  The dialog facilitates sequencing of
 * messages between the user agents and proper routing of requests
 * between both of them.  The dialog represents a context in which to
 * interpret SIP messages.
 * https://tools.ietf.org/html/rfc3261#section-12
 * @public
 */
declare class Dialog {
    protected core: UserAgentCore;
    protected dialogState: DialogState;
    /**
     * Dialog constructor.
     * @param core - User agent core.
     * @param dialogState - Initial dialog state.
     */
    protected constructor(core: UserAgentCore, dialogState: DialogState);
    /**
     * When a UAC receives a response that establishes a dialog, it
     * constructs the state of the dialog.  This state MUST be maintained
     * for the duration of the dialog.
     * https://tools.ietf.org/html/rfc3261#section-12.1.2
     * @param outgoingRequestMessage - Outgoing request message for dialog.
     * @param incomingResponseMessage - Incoming response message creating dialog.
     */
    static initialDialogStateForUserAgentClient(outgoingRequestMessage: OutgoingRequestMessage, incomingResponseMessage: IncomingResponseMessage): DialogState;
    /**
     * The UAS then constructs the state of the dialog.  This state MUST be
     * maintained for the duration of the dialog.
     * https://tools.ietf.org/html/rfc3261#section-12.1.1
     * @param incomingRequestMessage - Incoming request message creating dialog.
     * @param toTag - Tag in the To field in the response to the incoming request.
     */
    static initialDialogStateForUserAgentServer(incomingRequestMessage: IncomingRequestMessage, toTag: string, early?: boolean): DialogState;
    /** Destructor. */
    dispose(): void;
    /**
     * A dialog is identified at each UA with a dialog ID, which consists of
     * a Call-ID value, a local tag and a remote tag.  The dialog ID at each
     * UA involved in the dialog is not the same.  Specifically, the local
     * tag at one UA is identical to the remote tag at the peer UA.  The
     * tags are opaque tokens that facilitate the generation of unique
     * dialog IDs.
     * https://tools.ietf.org/html/rfc3261#section-12
     */
    get id(): string;
    /**
     * A dialog can also be in the "early" state, which occurs when it is
     * created with a provisional response, and then it transition to the
     * "confirmed" state when a 2xx final response received or is sent.
     *
     * Note: RFC 3261 is concise on when a dialog is "confirmed", but it
     * can be a point of confusion if an INVITE dialog is "confirmed" after
     * a 2xx is sent or after receiving the ACK for the 2xx response.
     * With careful reading it can be inferred a dialog is always is
     * "confirmed" when the 2xx is sent (regardless of type of dialog).
     * However a INVITE dialog does have additional considerations
     * when it is confirmed but an ACK has not yet been received (in
     * particular with regard to a callee sending BYE requests).
     */
    get early(): boolean;
    /** Call identifier component of the dialog id. */
    get callId(): string;
    /** Local tag component of the dialog id. */
    get localTag(): string;
    /** Remote tag component of the dialog id. */
    get remoteTag(): string;
    /** Local sequence number (used to order requests from the UA to its peer). */
    get localSequenceNumber(): number | undefined;
    /** Remote sequence number (used to order requests from its peer to the UA). */
    get remoteSequenceNumber(): number | undefined;
    /** Local URI. */
    get localURI(): URI;
    /** Remote URI. */
    get remoteURI(): URI;
    /** Remote target. */
    get remoteTarget(): URI;
    /**
     * Route set, which is an ordered list of URIs. The route set is the
     * list of servers that need to be traversed to send a request to the peer.
     */
    get routeSet(): Array<string>;
    /**
     * If the request was sent over TLS, and the Request-URI contained
     * a SIPS URI, the "secure" flag is set to true. *NOT IMPLEMENTED*
     */
    get secure(): boolean;
    /** The user agent core servicing this dialog. */
    get userAgentCore(): UserAgentCore;
    /** Confirm the dialog. Only matters if dialog is currently early. */
    confirm(): void;
    /**
     * Requests sent within a dialog, as any other requests, are atomic.  If
     * a particular request is accepted by the UAS, all the state changes
     * associated with it are performed.  If the request is rejected, none
     * of the state changes are performed.
     *
     *    Note that some requests, such as INVITEs, affect several pieces of
     *    state.
     *
     * https://tools.ietf.org/html/rfc3261#section-12.2.2
     * @param message - Incoming request message within this dialog.
     */
    receiveRequest(message: IncomingRequestMessage): void;
    /**
     * If the dialog identifier in the 2xx response matches the dialog
     * identifier of an existing dialog, the dialog MUST be transitioned to
     * the "confirmed" state, and the route set for the dialog MUST be
     * recomputed based on the 2xx response using the procedures of Section
     * 12.2.1.2.  Otherwise, a new dialog in the "confirmed" state MUST be
     * constructed using the procedures of Section 12.1.2.
     *
     * Note that the only piece of state that is recomputed is the route
     * set.  Other pieces of state such as the highest sequence numbers
     * (remote and local) sent within the dialog are not recomputed.  The
     * route set only is recomputed for backwards compatibility.  RFC
     * 2543 did not mandate mirroring of the Record-Route header field in
     * a 1xx, only 2xx.  However, we cannot update the entire state of
     * the dialog, since mid-dialog requests may have been sent within
     * the early dialog, modifying the sequence numbers, for example.
     *
     *  https://tools.ietf.org/html/rfc3261#section-13.2.2.4
     */
    recomputeRouteSet(message: IncomingResponseMessage): void;
    /**
     * A request within a dialog is constructed by using many of the
     * components of the state stored as part of the dialog.
     * https://tools.ietf.org/html/rfc3261#section-12.2.1.1
     * @param method - Outgoing request method.
     */
    createOutgoingRequestMessage(method: string, options?: {
        cseq?: number;
        extraHeaders?: Array<string>;
        body?: Body;
    }): OutgoingRequestMessage;
    /**
     * Increment the local sequence number by one.
     * It feels like this should be protected, but the current authentication handling currently
     * needs this to keep the dialog in sync when "auto re-sends" request messages.
     * @internal
     */
    incrementLocalSequenceNumber(): void;
    /**
     * If the remote sequence number was not empty, but the sequence number
     * of the request is lower than the remote sequence number, the request
     * is out of order and MUST be rejected with a 500 (Server Internal
     * Error) response.
     * https://tools.ietf.org/html/rfc3261#section-12.2.2
     * @param request - Incoming request to guard.
     * @returns True if the program execution is to continue in the branch in question.
     *          Otherwise a 500 Server Internal Error was stateless sent and request processing must stop.
     */
    protected sequenceGuard(message: IncomingRequestMessage): boolean;
}

/**
 * Dialog state.
 * @remarks
 * A dialog contains certain pieces of state needed for further message
 * transmissions within the dialog.  This state consists of the dialog
 * ID, a local sequence number (used to order requests from the UA to
 * its peer), a remote sequence number (used to order requests from its
 * peer to the UA), a local URI, a remote URI, remote target, a boolean
 * flag called "secure", and a route set, which is an ordered list of
 * URIs.  The route set is the list of servers that need to be traversed
 * to send a request to the peer.  A dialog can also be in the "early"
 * state, which occurs when it is created with a provisional response,
 * and then transition to the "confirmed" state when a 2xx final
 * response arrives.  For other responses, or if no response arrives at
 * all on that dialog, the early dialog terminates.
 *
 * https://tools.ietf.org/html/rfc3261#section-12
 * @public
 */
declare interface DialogState {
    id: string;
    early: boolean;
    callId: string;
    localTag: string;
    remoteTag: string;
    localSequenceNumber: number | undefined;
    remoteSequenceNumber: number | undefined;
    localURI: URI;
    remoteURI: URI;
    remoteTarget: URI;
    routeSet: Array<string>;
    secure: boolean;
}

/**
 * Digest Authentication.
 * @internal
 */
declare class DigestAuthentication {
    stale: boolean | undefined;
    private logger;
    private ha1;
    private username;
    private password;
    private cnonce;
    private nc;
    private ncHex;
    private response;
    private algorithm;
    private realm;
    private nonce;
    private opaque;
    private qop;
    private method;
    private uri;
    /**
     * Constructor.
     * @param loggerFactory - LoggerFactory.
     * @param username - Username.
     * @param password - Password.
     */
    constructor(loggerFactory: LoggerFactory, ha1: string | undefined, username: string | undefined, password: string | undefined);
    /**
     * Performs Digest authentication given a SIP request and the challenge
     * received in a response to that request.
     * @param request -
     * @param challenge -
     * @returns true if credentials were successfully generated, false otherwise.
     */
    authenticate(request: OutgoingRequestMessage, challenge: any, body?: string): boolean;
    /**
     * Return the Proxy-Authorization or WWW-Authorization header value.
     */
    toString(): string;
    /**
     * Generate the 'nc' value as required by Digest in this.ncHex by reading this.nc.
     */
    private updateNcHex;
    /**
     * Generate Digest 'response' value.
     */
    private calculateResponse;
}

/**
 * Generic observable.
 * @public
 */
export declare interface Emitter<T> {
    /**
     * Sets up a function that will be called whenever the target changes.
     * @param listener - Callback function.
     * @param options - An options object that specifies characteristics about the listener.
     *                  If once true, indicates that the listener should be invoked at most once after being added.
     *                  If once true, the listener would be automatically removed when invoked.
     */
    addListener(listener: (data: T) => void, options?: {
        once?: boolean;
    }): void;
    /**
     * Removes from the listener previously registered with addListener.
     * @param listener - Callback function.
     */
    removeListener(listener: (data: T) => void): void;
    /**
     * Registers a listener.
     * @param listener - Callback function.
     * @deprecated Use addListener.
     */
    on(listener: (data: T) => void): void;
    /**
     * Unregisters a listener.
     * @param listener - Callback function.
     * @deprecated Use removeListener.
     */
    off(listener: (data: T) => void): void;
    /**
     * Registers a listener then unregisters the listener after one event emission.
     * @param listener - Callback function.
     * @deprecated Use addListener.
     */
    once(listener: (data: T) => void): void;
}

/**
 * An {@link Emitter} implementation.
 * @internal
 */
export declare class EmitterImpl<T> implements Emitter<T> {
    private listeners;
    /**
     * Sets up a function that will be called whenever the target changes.
     * @param listener - Callback function.
     * @param options - An options object that specifies characteristics about the listener.
     *                  If once true, indicates that the listener should be invoked at most once after being added.
     *                  If once true, the listener would be automatically removed when invoked.
     */
    addListener(listener: (data: T) => void, options?: {
        once?: boolean;
    }): void;
    /**
     * Emit change.
     * @param data - Data to emit.
     */
    emit(data: T): void;
    /**
     * Removes all listeners previously registered with addListener.
     */
    removeAllListeners(): void;
    /**
     * Removes a listener previously registered with addListener.
     * @param listener - Callback function.
     */
    removeListener(listener: (data: T) => void): void;
    /**
     * Registers a listener.
     * @param listener - Callback function.
     * @deprecated Use addListener.
     */
    on(listener: (data: T) => void): void;
    /**
     * Unregisters a listener.
     * @param listener - Callback function.
     * @deprecated Use removeListener.
     */
    off(listener: (data: T) => void): void;
    /**
     * Registers a listener then unregisters the listener after one event emission.
     * @param listener - Callback function.
     * @deprecated Use addListener.
     */
    once(listener: (data: T) => void): void;
}

/**
 * An Exception is considered a condition that a reasonable application may wish to catch.
 * An Error indicates serious problems that a reasonable application should not try to catch.
 * @public
 */
declare abstract class Exception extends Error {
    protected constructor(message?: string);
}

/**
 * Incoming ACK request.
 * @public
 */
declare interface IncomingAckRequest {
    /** The incoming message. */
    readonly message: IncomingRequestMessage;
}

/**
 * Incoming BYE request.
 * @public
 */
declare interface IncomingByeRequest extends IncomingRequest {
}

/**
 * Incoming INFO request.
 * @public
 */
declare interface IncomingInfoRequest extends IncomingRequest {
}

/**
 * Incoming INVITE request.
 * @public
 */
declare interface IncomingInviteRequest extends IncomingRequest {
    /**
     * Send a 2xx positive final response to this request. Defaults to 200.
     * @param options - Response options bucket.
     * @returns Outgoing response and a confirmed Session.
     */
    accept(options?: ResponseOptions): OutgoingResponseWithSession;
    /**
     * Send a 1xx provisional response to this request. Defaults to 180. Excludes 100.
     * @param options - Response options bucket.
     * @returns Outgoing response and an early Session.
     */
    progress(options?: ResponseOptions): OutgoingResponseWithSession;
}

/**
 * Incoming message.
 * @public
 */
declare class IncomingMessage {
    viaBranch: string;
    method: string;
    body: string;
    toTag: string;
    to: NameAddrHeader;
    fromTag: string;
    from: NameAddrHeader;
    callId: string;
    cseq: number;
    via: {
        host: string;
        port: number;
    };
    headers: {
        [name: string]: Array<{
            parsed?: any;
            raw: string;
        }>;
    };
    referTo: string | undefined;
    data: string;
    /**
     * Insert a header of the given name and value into the last position of the
     * header array.
     * @param name - header name
     * @param value - header value
     */
    addHeader(name: string, value: string): void;
    /**
     * Get the value of the given header name at the given position.
     * @param name - header name
     * @returns Returns the specified header, undefined if header doesn't exist.
     */
    getHeader(name: string): string | undefined;
    /**
     * Get the header/s of the given name.
     * @param name - header name
     * @returns Array - with all the headers of the specified name.
     */
    getHeaders(name: string): Array<string>;
    /**
     * Verify the existence of the given header.
     * @param name - header name
     * @returns true if header with given name exists, false otherwise
     */
    hasHeader(name: string): boolean;
    /**
     * Parse the given header on the given index.
     * @param name - header name
     * @param idx - header index
     * @returns Parsed header object, undefined if the
     *   header is not present or in case of a parsing error.
     */
    parseHeader(name: string, idx?: number): any | undefined;
    /**
     * Message Header attribute selector. Alias of parseHeader.
     * @param name - header name
     * @param idx - header index
     * @returns Parsed header object, undefined if the
     *   header is not present or in case of a parsing error.
     *
     * @example
     * message.s('via',3).port
     */
    s(name: string, idx?: number): any | undefined;
    /**
     * Replace the value of the given header by the value.
     * @param name - header name
     * @param value - header value
     */
    setHeader(name: string, value: string): void;
    toString(): string;
}

/**
 * Incoming MESSAGE request.
 * @public
 */
declare interface IncomingMessageRequest extends IncomingRequest {
}

/**
 * Incoming NOTIFY request.
 * @public
 */
declare interface IncomingNotifyRequest extends IncomingRequest {
}

/**
 * Incoming PRACK request.
 * @public
 */
declare interface IncomingPrackRequest extends IncomingRequest {
}

/**
 * Incoming REFER request.
 * @public
 */
declare interface IncomingReferRequest extends IncomingRequest {
}

/**
 * Incoming REGISTER request.
 * @public
 */
declare interface IncomingRegisterRequest extends IncomingRequest {
}

/**
 * A SIP message sent from a remote client to a local server.
 * @remarks
 * For the purpose of invoking a particular operation.
 * https://tools.ietf.org/html/rfc3261#section-7.1
 * @public
 */
declare interface IncomingRequest {
    /** Delegate providing custom handling of this incoming request. */
    delegate?: IncomingRequestDelegate;
    /** The incoming message. */
    readonly message: IncomingRequestMessage;
    /**
     * Send a 2xx positive final response to this request. Defaults to 200.
     * @param options - Response options bucket.
     */
    accept(options?: ResponseOptions): OutgoingResponse;
    /**
     * Send a 1xx provisional response to this request. Defaults to 180. Excludes 100.
     * Note that per RFC 4320, this method may only be used to respond to INVITE requests.
     * @param options - Response options bucket.
     */
    progress(options?: ResponseOptions): OutgoingResponse;
    /**
     * Send a 3xx negative final response to this request. Defaults to 302.
     * @param contacts - Contacts to redirect the UAC to.
     * @param options - Response options bucket.
     */
    redirect(contacts: Array<URI>, options?: ResponseOptions): OutgoingResponse;
    /**
     * Send a 4xx, 5xx, or 6xx negative final response to this request. Defaults to 480.
     * @param options -  Response options bucket.
     */
    reject(options?: ResponseOptions): OutgoingResponse;
    /**
     * Send a 100 outgoing response to this request.
     * @param options - Response options bucket.
     */
    trying(options?: ResponseOptions): OutgoingResponse;
}

/**
 * Delegate providing custom handling of incoming requests.
 * @public
 */
declare interface IncomingRequestDelegate {
    /**
     * Receive CANCEL request.
     * https://tools.ietf.org/html/rfc3261#section-9.2
     * Note: Currently CANCEL is being handled as a special case.
     * No UAS is created to handle the CANCEL and the response to
     * it CANCEL is being handled statelessly by the user agent core.
     * As such, there is currently no way to externally impact the
     * response to the a CANCEL request and thus the method here is
     * receiving a "message" (as apposed to a "uas").
     * @param message - Incoming CANCEL request message.
     */
    onCancel?(message: IncomingRequestMessage): void;
    /**
     * A transport error occurred attempted to send a response.
     * @param error - Transport error.
     */
    onTransportError?(error: TransportError): void;
}

/**
 * Incoming request message.
 * @public
 */
declare class IncomingRequestMessage extends IncomingMessage {
    ruri: URI | undefined;
    constructor();
}

/**
 * Incoming NOTIFY request with associated {@link Subscription}.
 * @public
 */
declare interface IncomingRequestWithSubscription {
    /** The NOTIFY request which established the subscription. */
    readonly request: IncomingNotifyRequest;
    /** If subscription state is not "terminated", then the subscription. Otherwise undefined. */
    readonly subscription?: Subscription_2;
}

/**
 * A SIP message sent from a remote server to a local client.
 * @remarks
 * For indicating the status of a request sent from the client to the server.
 * https://tools.ietf.org/html/rfc3261#section-7.2
 * @public
 */
declare interface IncomingResponse {
    /** The incoming message. */
    readonly message: IncomingResponseMessage;
}

/**
 * Incoming response message.
 * @public
 */
declare class IncomingResponseMessage extends IncomingMessage {
    statusCode: number | undefined;
    reasonPhrase: string | undefined;
    constructor();
}

/**
 * Incoming SUBSCRIBE request.
 * @public
 */
declare interface IncomingSubscribeRequest extends IncomingRequest {
}

/**
 * An exchange of information (incoming INFO).
 * @public
 */
export declare class Info {
    private incomingInfoRequest;
    /** @internal */
    constructor(incomingInfoRequest: IncomingInfoRequest);
    /** Incoming MESSAGE request message. */
    get request(): IncomingRequestMessage;
    /** Accept the request. */
    accept(options?: ResponseOptions): Promise<void>;
    /** Reject the request. */
    reject(options?: ResponseOptions): Promise<void>;
}

/**
 * An invitation is an offer to establish a {@link Session} (incoming INVITE).
 * @public
 */
export declare class Invitation extends Session {
    private incomingInviteRequest;
    /**
     * Logger.
     */
    protected logger: Logger;
    /** @internal */
    protected _id: string;
    /** True if dispose() has been called. */
    private disposed;
    /** INVITE will be rejected if not accepted within a certain period time. */
    private expiresTimer;
    /** True if this Session has been Terminated due to a CANCEL request. */
    private isCanceled;
    /** Are reliable provisional responses required or supported. */
    private rel100;
    /** The current RSeq header value. */
    private rseq;
    /** INVITE will be rejected if final response not sent in a certain period time. */
    private userNoAnswerTimer;
    /** True if waiting for a PRACK before sending a 200 Ok. */
    private waitingForPrack;
    /** A Promise providing a defer when waiting for a PRACK. */
    private waitingForPrackPromise;
    /** Function to resolve when PRACK arrives. */
    private waitingForPrackResolve;
    /** Function to reject when PRACK never arrives. */
    private waitingForPrackReject;
    /** @internal */
    constructor(userAgent: UserAgent, incomingInviteRequest: IncomingInviteRequest);
    /**
     * Destructor.
     */
    dispose(): Promise<void>;
    /**
     * If true, a first provisional response after the 100 Trying
     * will be sent automatically. This is false it the UAC required
     * reliable provisional responses (100rel in Require header) or
     * the user agent configuration has specified to not send an
     * initial response, otherwise it is true. The provisional is sent by
     * calling `progress()` without any options.
     */
    get autoSendAnInitialProvisionalResponse(): boolean;
    /**
     * Initial incoming INVITE request message body.
     */
    get body(): string | undefined;
    /**
     * The identity of the local user.
     */
    get localIdentity(): NameAddrHeader;
    /**
     * The identity of the remote user.
     */
    get remoteIdentity(): NameAddrHeader;
    /**
     * Initial incoming INVITE request message.
     */
    get request(): IncomingRequestMessage;
    /**
     * Accept the invitation.
     *
     * @remarks
     * Accept the incoming INVITE request to start a Session.
     * Replies to the INVITE request with a 200 Ok response.
     * Resolves once the response sent, otherwise rejects.
     *
     * This method may reject for a variety of reasons including
     * the receipt of a CANCEL request before `accept` is able
     * to construct a response.
     * @param options - Options bucket.
     */
    accept(options?: InvitationAcceptOptions): Promise<void>;
    /**
     * Indicate progress processing the invitation.
     *
     * @remarks
     * Report progress to the the caller.
     * Replies to the INVITE request with a 1xx provisional response.
     * Resolves once the response sent, otherwise rejects.
     * @param options - Options bucket.
     */
    progress(options?: InvitationProgressOptions): Promise<void>;
    /**
     * Reject the invitation.
     *
     * @remarks
     * Replies to the INVITE request with a 4xx, 5xx, or 6xx final response.
     * Resolves once the response sent, otherwise rejects.
     *
     * The expectation is that this method is used to reject an INVITE request.
     * That is indeed the case - a call to `progress` followed by `reject` is
     * a typical way to "decline" an incoming INVITE request. However it may
     * also be called after calling `accept` (but only before it completes)
     * which will reject the call and cause `accept` to reject.
     * @param options - Options bucket.
     */
    reject(options?: InvitationRejectOptions): Promise<void>;
    /**
     * Handle CANCEL request.
     *
     * @param message - CANCEL message.
     * @internal
     */
    _onCancel(message: IncomingRequestMessage): void;
    /**
     * Helper function to handle offer/answer in a PRACK.
     */
    private handlePrackOfferAnswer;
    /**
     * A handler for errors which occur while attempting to send 1xx and 2xx responses.
     * In all cases, an attempt is made to reject the request if it is still outstanding.
     * And while there are a variety of things which can go wrong and we log something here
     * for all errors, there are a handful of common exceptions we pay some extra attention to.
     * @param error - The error which occurred.
     */
    private handleResponseError;
    /**
     * Callback for when ACK for a 2xx response is never received.
     * @param session - Session the ACK never arrived for.
     */
    private onAckTimeout;
    /**
     * A version of `accept` which resolves a session when the 200 Ok response is sent.
     * @param options - Options bucket.
     */
    private sendAccept;
    /**
     * A version of `progress` which resolves when the provisional response is sent.
     * @param options - Options bucket.
     */
    private sendProgress;
    /**
     * A version of `progress` which resolves when the provisional response with sdp is sent.
     * @param options - Options bucket.
     */
    private sendProgressWithSDP;
    /**
     * A version of `progress` which resolves when the reliable provisional response is sent.
     * @param options - Options bucket.
     */
    private sendProgressReliable;
    /**
     * A version of `progress` which resolves when the reliable provisional response is acknowledged.
     * @param options - Options bucket.
     */
    private sendProgressReliableWaitForPrack;
    /**
     * A version of `progress` which resolves when a 100 Trying provisional response is sent.
     */
    private sendProgressTrying;
    /**
     * When attempting to accept the INVITE, an invitation waits
     * for any outstanding PRACK to arrive before sending the 200 Ok.
     * It will be waiting on this Promise to resolve which lets it know
     * the PRACK has arrived and it may proceed to send the 200 Ok.
     */
    private waitForArrivalOfPrack;
    /**
     * Here we are resolving the promise which in turn will cause
     * the accept to proceed (it may still fail for other reasons, but...).
     */
    private prackArrived;
    /**
     * Here we are rejecting the promise which in turn will cause
     * the accept to fail and the session to transition to "terminated".
     */
    private prackNeverArrived;
}

/**
 * Options for {@link Invitation.accept}.
 * @public
 */
export declare interface InvitationAcceptOptions {
    /**
     * Array of extra headers added to the response.
     */
    extraHeaders?: Array<string>;
    /**
     * Modifiers to pass to SessionDescriptionHandler during the initial INVITE transaction.
     */
    sessionDescriptionHandlerModifiers?: Array<SessionDescriptionHandlerModifier>;
    /**
     * Options to pass to SessionDescriptionHandler during the initial INVITE transaction.
     */
    sessionDescriptionHandlerOptions?: SessionDescriptionHandlerOptions;
}

/**
 * Options for {@link Invitation.progress}.
 * @public
 */
export declare interface InvitationProgressOptions {
    /**
     * Body
     */
    body?: string | {
        body: string;
        contentType: string;
    };
    /**
     * Array of extra headers added to the response.
     */
    extraHeaders?: Array<string>;
    /**
     * Modifiers to pass to SessionDescriptionHandler during the initial INVITE transaction.
     */
    sessionDescriptionHandlerModifiers?: Array<SessionDescriptionHandlerModifier>;
    /**
     * Options to pass to SessionDescriptionHandler during the initial INVITE transaction.
     */
    sessionDescriptionHandlerOptions?: SessionDescriptionHandlerOptions;
    /**
     * Status code for response.
     */
    statusCode?: number;
    /**
     * Reason phrase for response.
     */
    reasonPhrase?: string;
    /**
     * Send reliable response.
     */
    rel100?: boolean;
}

/**
 * Options for {@link Invitation.reject}.
 * @public
 */
export declare interface InvitationRejectOptions {
    /**
     * Body
     */
    body?: string | {
        body: string;
        contentType: string;
    };
    /**
     * Array of extra headers added to the response.
     */
    extraHeaders?: Array<string>;
    /**
     * Status code for response.
     */
    statusCode?: number;
    /**
     * Reason phrase for response.
     */
    reasonPhrase?: string;
}

/**
 * An inviter offers to establish a {@link Session} (outgoing INVITE).
 * @public
 */
export declare class Inviter extends Session {
    /**
     * If this Inviter was created as a result of a REFER, the referred Session. Otherwise undefined.
     * @internal
     */
    _referred: Session | undefined;
    /**
     * Logger.
     */
    protected logger: Logger;
    /** @internal */
    protected _id: string;
    /** True if dispose() has been called. */
    private disposed;
    /** True if early media use is enabled. */
    private earlyMedia;
    /** The early media session. */
    private earlyMediaDialog;
    /** The early media session description handlers. */
    private earlyMediaSessionDescriptionHandlers;
    /** Our From tag. */
    private fromTag;
    /** True if cancel() was called. */
    private isCanceled;
    /** True if initial INVITE without SDP. */
    private inviteWithoutSdp;
    /** Initial INVITE request sent by core. Undefined until sent. */
    private outgoingInviteRequest;
    /** Initial INVITE message provided to core to send. */
    private outgoingRequestMessage;
    /**
     * Constructs a new instance of the `Inviter` class.
     * @param userAgent - User agent. See {@link UserAgent} for details.
     * @param targetURI - Request URI identifying the target of the message.
     * @param options - Options bucket. See {@link InviterOptions} for details.
     */
    constructor(userAgent: UserAgent, targetURI: URI, options?: InviterOptions);
    /**
     * Destructor.
     */
    dispose(): Promise<void>;
    /**
     * Initial outgoing INVITE request message body.
     */
    get body(): BodyAndContentType | undefined;
    /**
     * The identity of the local user.
     */
    get localIdentity(): NameAddrHeader;
    /**
     * The identity of the remote user.
     */
    get remoteIdentity(): NameAddrHeader;
    /**
     * Initial outgoing INVITE request message.
     */
    get request(): OutgoingRequestMessage;
    /**
     * Cancels the INVITE request.
     *
     * @remarks
     * Sends a CANCEL request.
     * Resolves once the response sent, otherwise rejects.
     *
     * After sending a CANCEL request the expectation is that a 487 final response
     * will be received for the INVITE. However a 200 final response to the INVITE
     * may nonetheless arrive (it's a race between the CANCEL reaching the UAS before
     * the UAS sends a 200) in which case an ACK & BYE will be sent. The net effect
     * is that this method will terminate the session regardless of the race.
     * @param options - Options bucket.
     */
    cancel(options?: InviterCancelOptions): Promise<void>;
    /**
     * Sends the INVITE request.
     *
     * @remarks
     * TLDR...
     *  1) Only one offer/answer exchange permitted during initial INVITE.
     *  2) No "early media" if the initial offer is in an INVITE (default behavior).
     *  3) If "early media" and the initial offer is in an INVITE, no INVITE forking.
     *
     * 1) Only one offer/answer exchange permitted during initial INVITE.
     *
     * Our implementation replaces the following bullet point...
     *
     * o  After having sent or received an answer to the first offer, the
     *    UAC MAY generate subsequent offers in requests based on rules
     *    specified for that method, but only if it has received answers
     *    to any previous offers, and has not sent any offers to which it
     *    hasn't gotten an answer.
     * https://tools.ietf.org/html/rfc3261#section-13.2.1
     *
     * ...with...
     *
     * o  After having sent or received an answer to the first offer, the
     *    UAC MUST NOT generate subsequent offers in requests based on rules
     *    specified for that method.
     *
     * ...which in combination with this bullet point...
     *
     * o  Once the UAS has sent or received an answer to the initial
     *    offer, it MUST NOT generate subsequent offers in any responses
     *    to the initial INVITE.  This means that a UAS based on this
     *    specification alone can never generate subsequent offers until
     *    completion of the initial transaction.
     * https://tools.ietf.org/html/rfc3261#section-13.2.1
     *
     * ...ensures that EXACTLY ONE offer/answer exchange will occur
     * during an initial out of dialog INVITE request made by our UAC.
     *
     *
     * 2) No "early media" if the initial offer is in an INVITE (default behavior).
     *
     * While our implementation adheres to the following bullet point...
     *
     * o  If the initial offer is in an INVITE, the answer MUST be in a
     *    reliable non-failure message from UAS back to UAC which is
     *    correlated to that INVITE.  For this specification, that is
     *    only the final 2xx response to that INVITE.  That same exact
     *    answer MAY also be placed in any provisional responses sent
     *    prior to the answer.  The UAC MUST treat the first session
     *    description it receives as the answer, and MUST ignore any
     *    session descriptions in subsequent responses to the initial
     *    INVITE.
     * https://tools.ietf.org/html/rfc3261#section-13.2.1
     *
     * We have made the following implementation decision with regard to early media...
     *
     * o  If the initial offer is in the INVITE, the answer from the
     *    UAS back to the UAC will establish a media session only
     *    only after the final 2xx response to that INVITE is received.
     *
     * The reason for this decision is rooted in a restriction currently
     * inherent in WebRTC. Specifically, while a SIP INVITE request with an
     * initial offer may fork resulting in more than one provisional answer,
     * there is currently no easy/good way to to "fork" an offer generated
     * by a peer connection. In particular, a WebRTC offer currently may only
     * be matched with one answer and we have no good way to know which
     * "provisional answer" is going to be the "final answer". So we have
     * decided to punt and not create any "early media" sessions in this case.
     *
     * The upshot is that if you want "early media", you must not put the
     * initial offer in the INVITE. Instead, force the UAS to provide the
     * initial offer by sending an INVITE without an offer. In the WebRTC
     * case this allows us to create a unique peer connection with a unique
     * answer for every provisional offer with "early media" on all of them.
     *
     *
     * 3) If "early media" and the initial offer is in an INVITE, no INVITE forking.
     *
     * The default behavior may be altered and "early media" utilized if the
     * initial offer is in the an INVITE by setting the `earlyMedia` options.
     * However in that case the INVITE request MUST NOT fork. This allows for
     * "early media" in environments where the forking behavior of the SIP
     * servers being utilized is configured to disallow forking.
     */
    invite(options?: InviterInviteOptions): Promise<OutgoingInviteRequest>;
    /**
     * 13.2.1 Creating the Initial INVITE
     *
     * Since the initial INVITE represents a request outside of a dialog,
     * its construction follows the procedures of Section 8.1.1.  Additional
     * processing is required for the specific case of INVITE.
     *
     * An Allow header field (Section 20.5) SHOULD be present in the INVITE.
     * It indicates what methods can be invoked within a dialog, on the UA
     * sending the INVITE, for the duration of the dialog.  For example, a
     * UA capable of receiving INFO requests within a dialog [34] SHOULD
     * include an Allow header field listing the INFO method.
     *
     * A Supported header field (Section 20.37) SHOULD be present in the
     * INVITE.  It enumerates all the extensions understood by the UAC.
     *
     * An Accept (Section 20.1) header field MAY be present in the INVITE.
     * It indicates which Content-Types are acceptable to the UA, in both
     * the response received by it, and in any subsequent requests sent to
     * it within dialogs established by the INVITE.  The Accept header field
     * is especially useful for indicating support of various session
     * description formats.
     *
     * The UAC MAY add an Expires header field (Section 20.19) to limit the
     * validity of the invitation.  If the time indicated in the Expires
     * header field is reached and no final answer for the INVITE has been
     * received, the UAC core SHOULD generate a CANCEL request for the
     * INVITE, as per Section 9.
     *
     * A UAC MAY also find it useful to add, among others, Subject (Section
     * 20.36), Organization (Section 20.25) and User-Agent (Section 20.41)
     * header fields.  They all contain information related to the INVITE.
     *
     * The UAC MAY choose to add a message body to the INVITE.  Section
     * 8.1.1.10 deals with how to construct the header fields -- Content-
     * Type among others -- needed to describe the message body.
     *
     * https://tools.ietf.org/html/rfc3261#section-13.2.1
     */
    private sendInvite;
    private disposeEarlyMedia;
    private notifyReferer;
    /**
     * Handle final response to initial INVITE.
     * @param inviteResponse - 2xx response.
     */
    private onAccept;
    /**
     * Handle provisional response to initial INVITE.
     * @param inviteResponse - 1xx response.
     */
    private onProgress;
    /**
     * Handle final response to initial INVITE.
     * @param inviteResponse - 3xx response.
     */
    private onRedirect;
    /**
     * Handle final response to initial INVITE.
     * @param inviteResponse - 4xx, 5xx, or 6xx response.
     */
    private onReject;
    /**
     * Handle final response to initial INVITE.
     * @param inviteResponse - 100 response.
     */
    private onTrying;
}

/**
 * Options for {@link Inviter.cancel}.
 * @public
 */
export declare interface InviterCancelOptions {
    extraHeaders?: Array<string>;
    reasonPhrase?: string;
    statusCode?: number;
}

/**
 * Options for {@link Inviter.invite}.
 * @public
 */
export declare interface InviterInviteOptions {
    /**
     * See `core` API.
     */
    requestDelegate?: OutgoingRequestDelegate;
    /**
     * See `core` API.
     */
    requestOptions?: RequestOptions;
    /**
     * Modifiers to pass to SessionDescriptionHandler during the initial INVITE transaction.
     */
    sessionDescriptionHandlerModifiers?: Array<SessionDescriptionHandlerModifier>;
    /**
     * Options to pass to SessionDescriptionHandler during the initial INVITE transaction.
     */
    sessionDescriptionHandlerOptions?: SessionDescriptionHandlerOptions;
    /**
     * If true, send INVITE without SDP. Default is false.
     */
    withoutSdp?: boolean;
}

/**
 * Options for {@link Inviter} constructor.
 * @public
 */
export declare interface InviterOptions extends SessionOptions {
    /** If true, an anonymous call. */
    anonymous?: boolean;
    /**
     * If true, the first answer to the local offer is immediately utilized for media.
     * Requires that the INVITE request MUST NOT fork.
     * Has no effect if `inviteWithoutSdp` is true.
     * Default is false.
     */
    earlyMedia?: boolean;
    /** Array of extra headers added to the INVITE. */
    extraHeaders?: Array<string>;
    /** If true, send INVITE without SDP. Default is false. */
    inviteWithoutSdp?: boolean;
    /** @deprecated TODO: provide alternative. */
    params?: {
        fromDisplayName?: string;
        fromTag?: string;
        fromUri?: string | URI;
        toDisplayName?: string;
        toUri?: string | URI;
    };
    /** @deprecated TODO: provide alternative. */
    renderbody?: string;
    /** @deprecated TODO: provide alternative. */
    rendertype?: string;
    /** Modifiers to pass to SessionDescriptionHandler during the initial INVITE transaction. */
    sessionDescriptionHandlerModifiers?: Array<SessionDescriptionHandlerModifier>;
    /** Options to pass to SessionDescriptionHandler during the initial INVITE transaction. */
    sessionDescriptionHandlerOptions?: SessionDescriptionHandlerOptions;
    /** Modifiers to pass to SessionDescriptionHandler during re-INVITE transactions. */
    sessionDescriptionHandlerModifiersReInvite?: Array<SessionDescriptionHandlerModifier>;
    /** Options to pass to SessionDescriptionHandler during re-INVITE transactions. */
    sessionDescriptionHandlerOptionsReInvite?: SessionDescriptionHandlerOptions;
}

/**
 * Log levels.
 * @public
 */
declare enum Levels {
    error = 0,
    warn = 1,
    log = 2,
    debug = 3
}

/**
 * Log connector function.
 * @public
 */
export declare type LogConnector = (level: LogLevel, category: string, label: string | undefined, content: string) => void;

/**
 * Logger.
 * @public
 */
declare class Logger {
    private logger;
    private category;
    private label;
    constructor(logger: LoggerFactory, category: string, label?: string);
    error(content: string): void;
    warn(content: string): void;
    log(content: string): void;
    debug(content: string): void;
    private genericLog;
    get level(): Levels;
    set level(newLevel: Levels);
}

/**
 * Logger.
 * @public
 */
declare class LoggerFactory {
    builtinEnabled: boolean;
    private _level;
    private _connector;
    private loggers;
    private logger;
    constructor();
    get level(): Levels;
    set level(newLevel: Levels);
    get connector(): ((level: string, category: string, label: string | undefined, content: any) => void) | undefined;
    set connector(value: ((level: string, category: string, label: string | undefined, content: any) => void) | undefined);
    getLogger(category: string, label?: string): Logger;
    genericLog(levelToLog: Levels, category: string, label: string | undefined, content: any): void;
    private print;
}

/**
 * Log level.
 * @public
 */
export declare type LogLevel = "debug" | "log" | "warn" | "error";

/**
 * A received message (incoming MESSAGE).
 * @public
 */
export declare class Message {
    private incomingMessageRequest;
    /** @internal */
    constructor(incomingMessageRequest: IncomingMessageRequest);
    /** Incoming MESSAGE request message. */
    get request(): IncomingRequestMessage;
    /** Accept the request. */
    accept(options?: ResponseOptions): Promise<void>;
    /** Reject the request. */
    reject(options?: ResponseOptions): Promise<void>;
}

/**
 * A messager sends a {@link Message} (outgoing MESSAGE).
 * @public
 */
export declare class Messager {
    private logger;
    private request;
    private userAgent;
    /**
     * Constructs a new instance of the `Messager` class.
     * @param userAgent - User agent. See {@link UserAgent} for details.
     * @param targetURI - Request URI identifying the target of the message.
     * @param content - Content for the body of the message.
     * @param contentType - Content type of the body of the message.
     * @param options - Options bucket. See {@link MessagerOptions} for details.
     */
    constructor(userAgent: UserAgent, targetURI: URI, content: string, contentType?: string, options?: MessagerOptions);
    /**
     * Send the message.
     */
    message(options?: MessagerMessageOptions): Promise<void>;
}

/**
 * Options for {@link Messager.message}.
 * @public
 */
export declare interface MessagerMessageOptions {
    /** See `core` API. */
    requestDelegate?: OutgoingRequestDelegate;
    /** See `core` API. */
    requestOptions?: RequestOptions;
}

/**
 * Options for {@link Messager} constructor.
 * @public
 */
export declare interface MessagerOptions {
    /** Array of extra headers added to the MESSAGE. */
    extraHeaders?: Array<string>;
    /** @deprecated TODO: provide alternative. */
    params?: {
        fromDisplayName?: string;
        fromTag?: string;
        fromUri?: string | URI;
        toDisplayName?: string;
        toUri?: string | URI;
    };
}

/**
 * Name Address SIP header.
 * @public
 */
declare class NameAddrHeader extends Parameters {
    uri: URI;
    private _displayName;
    /**
     * Constructor
     * @param uri -
     * @param displayName -
     * @param parameters -
     */
    constructor(uri: URI, displayName: string, parameters: {
        [name: string]: string;
    });
    get friendlyName(): string;
    get displayName(): string;
    set displayName(value: string);
    clone(): NameAddrHeader;
    toString(): string;
}

/**
 * A notification of an event (incoming NOTIFY).
 * @public
 */
export declare class Notification {
    private incomingNotifyRequest;
    /** @internal */
    constructor(incomingNotifyRequest: IncomingNotifyRequest);
    /** Incoming NOTIFY request message. */
    get request(): IncomingRequestMessage;
    /** Accept the request. */
    accept(options?: ResponseOptions): Promise<void>;
    /** Reject the request. */
    reject(options?: ResponseOptions): Promise<void>;
}

/**
 * NOTIFY UAS.
 * @public
 */
declare class NotifyUserAgentServer extends UserAgentServer implements IncomingNotifyRequest {
    /**
     * NOTIFY UAS constructor.
     * @param dialogOrCore - Dialog for in dialog NOTIFY, UserAgentCore for out of dialog NOTIFY (deprecated).
     * @param message - Incoming NOTIFY request message.
     */
    constructor(dialogOrCore: Dialog | UserAgentCore, message: IncomingRequestMessage, delegate?: IncomingRequestDelegate);
}

/**
 * Outgoing ACK request.
 * @public
 */
declare interface OutgoingAckRequest {
    /** The outgoing message. */
    readonly message: OutgoingRequestMessage;
}

/**
 * Outgoing BYE request.
 * @public
 */
declare interface OutgoingByeRequest extends OutgoingRequest {
}

/**
 * Outgoing INFO request.
 * @public
 */
declare interface OutgoingInfoRequest extends OutgoingRequest {
}

/**
 * Outgoing INVITE request.
 * @public
 */
declare interface OutgoingInviteRequest extends OutgoingRequest {
    /** Delegate providing custom handling of this outgoing INVITE request. */
    delegate?: OutgoingInviteRequestDelegate;
}

/**
 * Delegate providing custom handling of outgoing INVITE requests.
 * @public
 */
declare interface OutgoingInviteRequestDelegate extends OutgoingRequestDelegate {
    /**
     * Received a 2xx positive final response to this request.
     * @param response - Incoming response (including a confirmed Session).
     */
    onAccept?(response: AckableIncomingResponseWithSession): void;
    /**
     * Received a 1xx provisional response to this request. Excluding 100 responses.
     * @param response - Incoming response (including an early Session).
     */
    onProgress?(response: PrackableIncomingResponseWithSession): void;
}

/**
 * Outgoing MESSAGE request.
 * @public
 */
declare interface OutgoingMessageRequest extends OutgoingRequest {
}

/**
 * Outgoing NOTIFY request.
 * @public
 */
declare interface OutgoingNotifyRequest extends OutgoingRequest {
}

/**
 * Outgoing PRACK request.
 * @public
 */
declare interface OutgoingPrackRequest extends OutgoingRequest {
}

/**
 * Outgoing PUBLISH request.
 * @public
 */
declare interface OutgoingPublishRequest extends OutgoingRequest {
}

/**
 * Outgoing REFER request.
 * @public
 */
declare interface OutgoingReferRequest extends OutgoingRequest {
}

/**
 * Outgoing REGISTER request.
 * @public
 */
declare interface OutgoingRegisterRequest extends OutgoingRequest {
}

/**
 * A SIP message sent from a local client to a remote server.
 * @remarks
 * For the purpose of invoking a particular operation.
 * https://tools.ietf.org/html/rfc3261#section-7.1
 * @public
 */
declare interface OutgoingRequest {
    /** Delegate providing custom handling of this outgoing request. */
    delegate?: OutgoingRequestDelegate;
    /** The outgoing message. */
    readonly message: OutgoingRequestMessage;
    /**
     * Destroy request.
     */
    dispose(): void;
    /**
     * Sends a CANCEL message targeting this request to the UAS.
     * @param reason - Reason for canceling request.
     * @param options - Request options bucket.
     */
    cancel(reason?: string, options?: RequestOptions): void;
}

/**
 * Delegate providing custom handling of outgoing requests.
 * @public
 */
declare interface OutgoingRequestDelegate {
    /**
     * Received a 2xx positive final response to this request.
     * @param response - Incoming response.
     */
    onAccept?(response: IncomingResponse): void;
    /**
     * Received a 1xx provisional response to this request. Excluding 100 responses.
     * @param response - Incoming response.
     */
    onProgress?(response: IncomingResponse): void;
    /**
     * Received a 3xx negative final response to this request.
     * @param response - Incoming response.
     */
    onRedirect?(response: IncomingResponse): void;
    /**
     * Received a 4xx, 5xx, or 6xx negative final response to this request.
     * @param response - Incoming response.
     */
    onReject?(response: IncomingResponse): void;
    /**
     * Received a 100 provisional response.
     * @param response - Incoming response.
     */
    onTrying?(response: IncomingResponse): void;
}

/**
 * Outgoing SIP request message.
 * @public
 */
declare class OutgoingRequestMessage {
    readonly headers: {
        [name: string]: Array<string>;
    };
    readonly method: string;
    readonly ruri: URI;
    readonly from: NameAddrHeader;
    readonly fromTag: string;
    readonly fromURI: URI;
    readonly to: NameAddrHeader;
    readonly toTag: string | undefined;
    readonly toURI: URI;
    branch: string | undefined;
    readonly callId: string;
    cseq: number;
    extraHeaders: Array<string>;
    body: {
        body: string;
        contentType: string;
    } | undefined;
    private options;
    constructor(method: string, ruri: URI, fromURI: URI, toURI: URI, options?: OutgoingRequestMessageOptions, extraHeaders?: Array<string>, body?: Body);
    /** Get a copy of the default options. */
    private static getDefaultOptions;
    private static makeNameAddrHeader;
    /**
     * Get the value of the given header name at the given position.
     * @param name - header name
     * @returns Returns the specified header, undefined if header doesn't exist.
     */
    getHeader(name: string): string | undefined;
    /**
     * Get the header/s of the given name.
     * @param name - header name
     * @returns Array with all the headers of the specified name.
     */
    getHeaders(name: string): Array<string>;
    /**
     * Verify the existence of the given header.
     * @param name - header name
     * @returns true if header with given name exists, false otherwise
     */
    hasHeader(name: string): boolean;
    /**
     * Replace the the given header by the given value.
     * @param name - header name
     * @param value - header value
     */
    setHeader(name: string, value: string | Array<string>): void;
    /**
     * The Via header field indicates the transport used for the transaction
     * and identifies the location where the response is to be sent.  A Via
     * header field value is added only after the transport that will be
     * used to reach the next hop has been selected (which may involve the
     * usage of the procedures in [4]).
     *
     * When the UAC creates a request, it MUST insert a Via into that
     * request.  The protocol name and protocol version in the header field
     * MUST be SIP and 2.0, respectively.  The Via header field value MUST
     * contain a branch parameter.  This parameter is used to identify the
     * transaction created by that request.  This parameter is used by both
     * the client and the server.
     * https://tools.ietf.org/html/rfc3261#section-8.1.1.7
     * @param branchParameter - The branch parameter.
     * @param transport - The sent protocol transport.
     */
    setViaHeader(branch: string, transport: string): void;
    toString(): string;
}

/**
 * Outgoing request message options.
 * @public
 */
declare interface OutgoingRequestMessageOptions {
    callId?: string;
    callIdPrefix?: string;
    cseq?: number;
    toDisplayName?: string;
    toTag?: string;
    fromDisplayName?: string;
    fromTag?: string;
    forceRport?: boolean;
    hackViaTcp?: boolean;
    optionTags?: Array<string>;
    routeSet?: Array<string>;
    userAgentString?: string;
    viaHost?: string;
}

/**
 * A SIP message sent from a local server to a remote client.
 * @remarks
 * For indicating the status of a request sent from the client to the server.
 * https://tools.ietf.org/html/rfc3261#section-7.2
 * @public
 */
declare interface OutgoingResponse {
    /** The outgoing message. */
    readonly message: string;
}

/**
 * Outgoing INVITE response with the associated {@link Session}.
 * @public
 */
declare interface OutgoingResponseWithSession extends OutgoingResponse {
    /**
     * Session associated with incoming request acceptance, or
     * Session associated with incoming request progress (if an out of dialog request, an early dialog).
     */
    readonly session: Session_2;
}

/**
 * Outgoing SUBSCRIBE request.
 * @public
 */
declare interface OutgoingSubscribeRequest extends OutgoingRequest {
    /** Delegate providing custom handling of this outgoing SUBSCRIBE request. */
    delegate?: OutgoingSubscribeRequestDelegate;
    /** Stop waiting for an inital subscription creating NOTIFY. */
    waitNotifyStop(): void;
}

/**
 * Delegate providing custom handling of outgoing SUBSCRIBE requests.
 * @public
 */
declare interface OutgoingSubscribeRequestDelegate extends OutgoingRequestDelegate {
    /**
     * Received the initial subscription creating NOTIFY in response to this request.
     * Called for out of dialog SUBSCRIBE requests only (not called for re-SUBSCRIBE requests).
     * @param request - Incoming NOTIFY request (including a Subscription).
     */
    onNotify?(request: IncomingRequestWithSubscription): void;
    /**
     * Timed out waiting to receive the initial subscription creating NOTIFY in response to this request.
     * Called for out of dialog SUBSCRIBE requests only (not called for re-SUBSCRIBE requests).
     */
    onNotifyTimeout?(): void;
}

/**
 * @internal
 */
declare class Parameters {
    parameters: {
        [name: string]: string | null;
    };
    constructor(parameters: {
        [name: string]: string | number | null | undefined;
    });
    setParam(key: string, value: string | number | null | undefined): void;
    getParam(key: string): string | null | undefined;
    hasParam(key: string): boolean;
    deleteParam(key: string): string | null | undefined;
    clearParams(): void;
}

/**
 * Incoming INVITE response received when request is progressed.
 * @public
 */
declare interface PrackableIncomingResponseWithSession extends IncomingResponse {
    /** Session associated with outgoing request progress. If out of dialog request, an early dialog. */
    readonly session: Session_2;
    /**
     * Send an PRACK to acknowledge this response.
     * @param options - Request options bucket.
     */
    prack(options?: RequestOptions): OutgoingPrackRequest;
}

/**
 * A publisher publishes a publication (outgoing PUBLISH).
 * @public
 */
export declare class Publisher {
    private event;
    private options;
    private target;
    private pubRequestBody;
    private pubRequestExpires;
    private pubRequestEtag;
    private publishRefreshTimer;
    private disposed;
    private id;
    private logger;
    private request;
    private userAgent;
    /** The publication state. */
    private _state;
    /** Emits when the registration state changes. */
    private _stateEventEmitter;
    /**
     * Constructs a new instance of the `Publisher` class.
     *
     * @param userAgent - User agent. See {@link UserAgent} for details.
     * @param targetURI - Request URI identifying the target of the message.
     * @param eventType - The event type identifying the published document.
     * @param options - Options bucket. See {@link PublisherOptions} for details.
     */
    constructor(userAgent: UserAgent, targetURI: URI, eventType: string, options?: PublisherOptions);
    /**
     * Destructor.
     */
    dispose(): Promise<void>;
    /** The publication state. */
    get state(): PublisherState;
    /** Emits when the publisher state changes. */
    get stateChange(): Emitter<PublisherState>;
    /**
     * Publish.
     * @param content - Body to publish
     */
    publish(content: string, options?: PublisherPublishOptions): Promise<void>;
    /**
     * Unpublish.
     */
    unpublish(options?: PublisherUnpublishOptions): Promise<void>;
    /** @internal */
    protected receiveResponse(response: IncomingResponseMessage): void;
    /** @internal */
    protected send(): OutgoingPublishRequest;
    private refreshRequest;
    private sendPublishRequest;
    /**
     * Transition publication state.
     */
    private stateTransition;
}

/**
 * Options for {@link Publisher} constructor.
 * @public
 */
export declare interface PublisherOptions {
    /** @deprecated TODO: provide alternative. */
    body?: string;
    /** @deprecated TODO: provide alternative. */
    contentType?: string;
    /**
     * Expire value for the published event.
     * @defaultValue 3600
     */
    expires?: number;
    /**
     * Array of extra headers added to the PUBLISH request message.
     */
    extraHeaders?: Array<string>;
    /** @deprecated TODO: provide alternative. */
    params?: {
        fromDisplayName?: string;
        fromTag?: string;
        fromUri?: URI;
        toDisplayName?: string;
        toUri?: URI;
    };
    /**
     * If set true, UA will gracefully unpublish for the event on UA close.
     * @defaultValue true
     */
    unpublishOnClose?: boolean;
}

/**
 * Options for {@link Publisher.publish}.
 * @public
 */
export declare interface PublisherPublishOptions {
}

/**
 * {@link Publisher} state.
 * @remarks
 * The {@link Publisher} behaves in a deterministic manner according to the following
 * Finite State Machine (FSM).
 * ```txt
 *                  __________________________________________
 *                 |  __________________________              |
 * Publisher       | |                          v             v
 * Constructed -> Initial -> Published -> Unpublished -> Terminated
 *                              |   ^____________|             ^
 *                              |______________________________|
 * ```
 * @public
 */
export declare enum PublisherState {
    Initial = "Initial",
    Published = "Published",
    Unpublished = "Unpublished",
    Terminated = "Terminated"
}

/**
 * Options for {@link Publisher.unpublish}.
 * @public
 */
export declare interface PublisherUnpublishOptions {
}

/**
 * A request to establish a {@link Session} elsewhere (incoming REFER).
 * @public
 */
export declare class Referral {
    private incomingReferRequest;
    private session;
    private inviter;
    /** @internal */
    constructor(incomingReferRequest: IncomingReferRequest, session: Session);
    get referTo(): NameAddrHeader;
    get referredBy(): string | undefined;
    get replaces(): string | undefined;
    /** Incoming REFER request message. */
    get request(): IncomingRequestMessage;
    /** Accept the request. */
    accept(options?: ResponseOptions): Promise<void>;
    /** Reject the request. */
    reject(options?: ResponseOptions): Promise<void>;
    /**
     * Creates an inviter which may be used to send an out of dialog INVITE request.
     *
     * @remarks
     * This a helper method to create an Inviter which will execute the referral
     * of the `Session` which was referred. The appropriate headers are set and
     * the referred `Session` is linked to the new `Session`. Note that only a
     * single instance of the `Inviter` will be created and returned (if called
     * more than once a reference to the same `Inviter` will be returned every time).
     *
     * @param options - Options bucket.
     * @param modifiers - Session description handler modifiers.
     */
    makeInviter(options?: InviterOptions): Inviter;
}

/**
 * A registerer registers a contact for an address of record (outgoing REGISTER).
 * @public
 */
export declare class Registerer {
    private static readonly defaultExpires;
    private static readonly defaultRefreshFrequency;
    private disposed;
    private id;
    private expires;
    private refreshFrequency;
    private logger;
    private options;
    private request;
    private userAgent;
    private registrationExpiredTimer;
    private registrationTimer;
    /** The contacts returned from the most recent accepted REGISTER request. */
    private _contacts;
    /** The number of seconds to wait before retrying to register. */
    private _retryAfter;
    /** The registration state. */
    private _state;
    /** Emits when the registration state changes. */
    private _stateEventEmitter;
    /** True is waiting for final response to outstanding REGISTER request. */
    private _waiting;
    /** Emits when waiting changes. */
    private _waitingEventEmitter;
    /**
     * Constructs a new instance of the `Registerer` class.
     * @param userAgent - User agent. See {@link UserAgent} for details.
     * @param options - Options bucket. See {@link RegistererOptions} for details.
     */
    constructor(userAgent: UserAgent, options?: RegistererOptions);
    /** Default registerer options. */
    private static defaultOptions;
    /**
     * Strip properties with undefined values from options.
     * This is a work around while waiting for missing vs undefined to be addressed (or not)...
     * https://github.com/Microsoft/TypeScript/issues/13195
     * @param options - Options to reduce
     */
    private static stripUndefinedProperties;
    /** The registered contacts. */
    get contacts(): Array<string>;
    /**
     * The number of seconds to wait before retrying to register.
     * @defaultValue `undefined`
     * @remarks
     * When the server rejects a registration request, if it provides a suggested
     * duration to wait before retrying, that value is available here when and if
     * the state transitions to `Unsubscribed`. It is also available during the
     * callback to `onReject` after a call to `register`. (Note that if the state
     * if already `Unsubscribed`, a rejected request created by `register` will
     * not cause the state to transition to `Unsubscribed`. One way to avoid this
     * case is to dispose of `Registerer` when unregistered and create a new
     * `Registerer` for any attempts to retry registering.)
     * @example
     * ```ts
     * // Checking for retry after on state change
     * registerer.stateChange.addListener((newState) => {
     *   switch (newState) {
     *     case RegistererState.Unregistered:
     *       const retryAfter = registerer.retryAfter;
     *       break;
     *   }
     * });
     *
     * // Checking for retry after on request rejection
     * registerer.register({
     *   requestDelegate: {
     *     onReject: () => {
     *       const retryAfter = registerer.retryAfter;
     *     }
     *   }
     * });
     * ```
     */
    get retryAfter(): number | undefined;
    /** The registration state. */
    get state(): RegistererState;
    /** Emits when the registerer state changes. */
    get stateChange(): Emitter<RegistererState>;
    /** Destructor. */
    dispose(): Promise<void>;
    /**
     * Sends the REGISTER request.
     * @remarks
     * If successful, sends re-REGISTER requests prior to registration expiration until `unsubscribe()` is called.
     * Rejects with `RequestPendingError` if a REGISTER request is already in progress.
     */
    register(options?: RegistererRegisterOptions): Promise<OutgoingRegisterRequest>;
    /**
     * Sends the REGISTER request with expires equal to zero.
     * @remarks
     * Rejects with `RequestPendingError` if a REGISTER request is already in progress.
     */
    unregister(options?: RegistererUnregisterOptions): Promise<OutgoingRegisterRequest>;
    /**
     * Clear registration timers.
     */
    private clearTimers;
    /**
     * Generate Contact Header
     */
    private generateContactHeader;
    /**
     * Helper function, called when registered.
     */
    private registered;
    /**
     * Helper function, called when unregistered.
     */
    private unregistered;
    /**
     * Helper function, called when terminated.
     */
    private terminated;
    /**
     * Transition registration state.
     */
    private stateTransition;
    /** True if the registerer is currently waiting for final response to a REGISTER request. */
    private get waiting();
    /** Emits when the registerer waiting state changes. */
    private get waitingChange();
    /**
     * Toggle waiting.
     */
    private waitingToggle;
    /** Hopefully helpful as the standard behavior has been found to be unexpected. */
    private waitingWarning;
    /** Hopefully helpful as the standard behavior has been found to be unexpected. */
    private stateError;
}

/**
 * Options for {@link Registerer} constructor.
 * @public
 */
export declare interface RegistererOptions {
    /** Registration expiration time in seconds. */
    expires?: number;
    /** Array of extra Contact header parameters. */
    extraContactHeaderParams?: Array<string>;
    /** Array of extra headers added to the REGISTER. */
    extraHeaders?: Array<string>;
    /**
     * UUID to provide with "+sip.instance" Contact parameter.
     * @defaultValue A randomly generated uuid
     * @deprecated Use UserAgentOptions.instanceId
     */
    instanceId?: string;
    /**
     * If true, constructor logs the registerer configuration.
     * @defaultValue `true`
     */
    logConfiguration?: boolean;
    /** @deprecated TODO: provide alternative. */
    params?: {
        fromDisplayName?: string;
        fromTag?: string;
        fromUri?: URI;
        toDisplayName?: string;
        toUri?: URI;
    };
    /**
     * Value to provide with "reg-id" Contact parameter.
     * @defaultValue 1
     */
    regId?: number;
    /**
     * The URI of the registrar to send the REGISTER requests.
     * @defaultValue domain portion of the user agent's uri
     */
    registrar?: URI;
    /**
     * Determines when a re-REGISTER request is sent. The value should be specified as a percentage of the expiration time (between 50 and 99).
     * @defaultValue 99
     */
    refreshFrequency?: number;
}

/**
 * Options for {@link Registerer.register}.
 * @public
 */
export declare interface RegistererRegisterOptions {
    /** See `core` API. */
    requestDelegate?: OutgoingRequestDelegate;
    /** See `core` API. */
    requestOptions?: RequestOptions;
}

/**
 * {@link Registerer} state.
 * @remarks
 * The {@link Registerer} behaves in a deterministic manner according to the following
 * Finite State Machine (FSM).
 * ```txt
 *                   __________________________________________
 *                  |  __________________________              |
 * Registerer       | |                          v             v
 * Constructed -> Initial -> Registered -> Unregistered -> Terminated
 *                              |   ^____________|             ^
 *                              |______________________________|
 * ```
 * @public
 */
export declare enum RegistererState {
    Initial = "Initial",
    Registered = "Registered",
    Unregistered = "Unregistered",
    Terminated = "Terminated"
}

/**
 * Options for {@link Registerer.unregister}.
 * @public
 */
export declare interface RegistererUnregisterOptions {
    /**
     * If true, unregister all contacts.
     * @defaultValue false
     */
    all?: boolean;
    /** See `core` API. */
    requestDelegate?: OutgoingRequestDelegate;
    /** See `core` API. */
    requestOptions?: RequestOptions;
}

/**
 * Request options bucket.
 * @public
 */
declare interface RequestOptions {
    /** Extra headers to include in the message. */
    extraHeaders?: Array<string>;
    /** Body to include in the message. */
    body?: Body;
}

/**
 * An exception indicating an outstanding prior request prevented execution.
 * @public
 */
export declare class RequestPendingError extends Exception {
    /** @internal */
    constructor(message?: string);
}

/**
 * Response options bucket.
 * @public
 */
declare interface ResponseOptions {
    /** Status code of the response. */
    statusCode: number;
    /** Reason phrase of the response. */
    reasonPhrase?: string;
    /** To tag of the response. If not provided, one is generated. */
    toTag?: string;
    /** User agent string for User-Agent header. */
    userAgent?: string;
    /** Support options tags for Supported header. */
    supported?: Array<string>;
    /** Extra headers to include in the message. */
    extraHeaders?: Array<string>;
    /** Body to include in the message. */
    body?: Body;
}

/**
 * Server Transaction.
 * @remarks
 * The server transaction is responsible for the delivery of requests to
 * the TU and the reliable transmission of responses.  It accomplishes
 * this through a state machine.  Server transactions are created by the
 * core when a request is received, and transaction handling is desired
 * for that request (this is not always the case).
 * https://tools.ietf.org/html/rfc3261#section-17.2
 * @public
 */
declare abstract class ServerTransaction extends Transaction {
    private _request;
    protected user: ServerTransactionUser;
    protected constructor(_request: IncomingRequestMessage, transport: Transport_2, user: ServerTransactionUser, state: TransactionState, loggerCategory: string);
    /** The incoming request the transaction handling. */
    get request(): IncomingRequestMessage;
    /**
     * Receive incoming requests from the transport which match this transaction.
     * @param request - The incoming request.
     */
    abstract receiveRequest(request: IncomingRequestMessage): void;
    /**
     * Receive outgoing responses to this request from the transaction user.
     * Responses will be delivered to the transport as necessary.
     * @param statusCode - Response status code.
     * @param response - Response.
     */
    abstract receiveResponse(statusCode: number, response: string): void;
}

declare type ServerTransactionConstructor = new (message: IncomingRequestMessage, transport: Transport_2, user: ServerTransactionUser) => ServerTransaction;

/**
 * UAS Core Transaction User.
 * @public
 */
declare interface ServerTransactionUser extends TransactionUser {
}

/**
 * A session provides real time communication between one or more participants.
 *
 * @remarks
 * The transport behaves in a deterministic manner according to the
 * the state defined in {@link SessionState}.
 * @public
 */
export declare abstract class Session {
    /**
     * Property reserved for use by instance owner.
     * @defaultValue `undefined`
     */
    data: unknown;
    /**
     * The session delegate.
     * @defaultValue `undefined`
     */
    delegate: SessionDelegate | undefined;
    /** @internal */
    _contact: string | undefined;
    /** @internal */
    _referral: Inviter | undefined;
    /** @internal */
    _replacee: Session | undefined;
    /** @internal */
    protected _assertedIdentity: NameAddrHeader | undefined;
    /** @internal */
    protected _dialog: Session_2 | undefined;
    /** @internal */
    protected _referralInviterOptions: InviterOptions | undefined;
    /** @internal */
    protected _renderbody: string | undefined;
    /** @internal */
    protected _rendertype: string | undefined;
    /** If defined, NOTIFYs associated with a REFER subscription are delivered here. */
    private onNotify;
    /** True if there is an outgoing re-INVITE request outstanding. */
    private pendingReinvite;
    /** True if there is an incoming re-INVITE ACK request outstanding. */
    private pendingReinviteAck;
    /** Dialogs session description handler. */
    private _sessionDescriptionHandler;
    /** SDH modifiers for the initial INVITE transaction. */
    private _sessionDescriptionHandlerModifiers;
    /** SDH options for the initial INVITE transaction. */
    private _sessionDescriptionHandlerOptions;
    /** SDH modifiers for re-INVITE transactions. */
    private _sessionDescriptionHandlerModifiersReInvite;
    /** SDH options for re-NVITE transactions.*/
    private _sessionDescriptionHandlerOptionsReInvite;
    /** Session state. */
    private _state;
    /** Session state emitter. */
    private _stateEventEmitter;
    /** User agent. */
    private _userAgent;
    /**
     * The identity of the local user.
     */
    abstract readonly localIdentity: NameAddrHeader;
    /**
     * The identity of the remote user.
     */
    abstract readonly remoteIdentity: NameAddrHeader;
    /**
     * Logger.
     */
    protected abstract logger: Logger;
    /** @internal */
    protected abstract _id: string;
    /**
     * Constructor.
     * @param userAgent - User agent. See {@link UserAgent} for details.
     * @internal
     */
    protected constructor(userAgent: UserAgent, options?: SessionOptions);
    /**
     * Destructor.
     */
    dispose(): Promise<void>;
    /**
     * The asserted identity of the remote user.
     */
    get assertedIdentity(): NameAddrHeader | undefined;
    /**
     * The confirmed session dialog.
     */
    get dialog(): Session_2 | undefined;
    /**
     * A unique identifier for this session.
     */
    get id(): string;
    /**
     * The session being replace by this one.
     */
    get replacee(): Session | undefined;
    /**
     * Session description handler.
     * @remarks
     * If `this` is an instance of `Invitation`,
     * `sessionDescriptionHandler` will be defined when the session state changes to "established".
     * If `this` is an instance of `Inviter` and an offer was sent in the INVITE,
     * `sessionDescriptionHandler` will be defined when the session state changes to "establishing".
     * If `this` is an instance of `Inviter` and an offer was not sent in the INVITE,
     * `sessionDescriptionHandler` will be defined when the session state changes to "established".
     * Otherwise `undefined`.
     */
    get sessionDescriptionHandler(): SessionDescriptionHandler | undefined;
    /**
     * Session description handler factory.
     */
    get sessionDescriptionHandlerFactory(): SessionDescriptionHandlerFactory;
    /**
     * SDH modifiers for the initial INVITE transaction.
     * @remarks
     * Used in all cases when handling the initial INVITE transaction as either UAC or UAS.
     * May be set directly at anytime.
     * May optionally be set via constructor option.
     * May optionally be set via options passed to Inviter.invite() or Invitation.accept().
     */
    get sessionDescriptionHandlerModifiers(): Array<SessionDescriptionHandlerModifier>;
    set sessionDescriptionHandlerModifiers(modifiers: Array<SessionDescriptionHandlerModifier>);
    /**
     * SDH options for the initial INVITE transaction.
     * @remarks
     * Used in all cases when handling the initial INVITE transaction as either UAC or UAS.
     * May be set directly at anytime.
     * May optionally be set via constructor option.
     * May optionally be set via options passed to Inviter.invite() or Invitation.accept().
     */
    get sessionDescriptionHandlerOptions(): SessionDescriptionHandlerOptions;
    set sessionDescriptionHandlerOptions(options: SessionDescriptionHandlerOptions);
    /**
     * SDH modifiers for re-INVITE transactions.
     * @remarks
     * Used in all cases when handling a re-INVITE transaction as either UAC or UAS.
     * May be set directly at anytime.
     * May optionally be set via constructor option.
     * May optionally be set via options passed to Session.invite().
     */
    get sessionDescriptionHandlerModifiersReInvite(): Array<SessionDescriptionHandlerModifier>;
    set sessionDescriptionHandlerModifiersReInvite(modifiers: Array<SessionDescriptionHandlerModifier>);
    /**
     * SDH options for re-INVITE transactions.
     * @remarks
     * Used in all cases when handling a re-INVITE transaction as either UAC or UAS.
     * May be set directly at anytime.
     * May optionally be set via constructor option.
     * May optionally be set via options passed to Session.invite().
     */
    get sessionDescriptionHandlerOptionsReInvite(): SessionDescriptionHandlerOptions;
    set sessionDescriptionHandlerOptionsReInvite(options: SessionDescriptionHandlerOptions);
    /**
     * Session state.
     */
    get state(): SessionState;
    /**
     * Session state change emitter.
     */
    get stateChange(): Emitter<SessionState>;
    /**
     * The user agent.
     */
    get userAgent(): UserAgent;
    /**
     * End the {@link Session}. Sends a BYE.
     * @param options - Options bucket. See {@link SessionByeOptions} for details.
     */
    bye(options?: SessionByeOptions): Promise<OutgoingByeRequest>;
    /**
     * Share {@link Info} with peer. Sends an INFO.
     * @param options - Options bucket. See {@link SessionInfoOptions} for details.
     */
    info(options?: SessionInfoOptions): Promise<OutgoingInfoRequest>;
    /**
     * Renegotiate the session. Sends a re-INVITE.
     * @param options - Options bucket. See {@link SessionInviteOptions} for details.
     */
    invite(options?: SessionInviteOptions): Promise<OutgoingInviteRequest>;
    /**
     * Deliver a {@link Message}. Sends a MESSAGE.
     * @param options - Options bucket. See {@link SessionMessageOptions} for details.
     */
    message(options?: SessionMessageOptions): Promise<OutgoingMessageRequest>;
    /**
     * Proffer a {@link Referral}. Send a REFER.
     * @param referTo - The referral target. If a `Session`, a REFER w/Replaces is sent.
     * @param options - Options bucket. See {@link SessionReferOptions} for details.
     */
    refer(referTo: URI | Session, options?: SessionReferOptions): Promise<OutgoingReferRequest>;
    /**
     * Send BYE.
     * @param delegate - Request delegate.
     * @param options - Request options bucket.
     * @internal
     */
    _bye(delegate?: OutgoingRequestDelegate, options?: RequestOptions): Promise<OutgoingByeRequest>;
    /**
     * Send INFO.
     * @param delegate - Request delegate.
     * @param options - Request options bucket.
     * @internal
     */
    _info(delegate?: OutgoingRequestDelegate, options?: RequestOptions): Promise<OutgoingInfoRequest>;
    /**
     * Send MESSAGE.
     * @param delegate - Request delegate.
     * @param options - Request options bucket.
     * @internal
     */
    _message(delegate?: OutgoingRequestDelegate, options?: RequestOptions): Promise<OutgoingMessageRequest>;
    /**
     * Send REFER.
     * @param onNotify - Notification callback.
     * @param delegate - Request delegate.
     * @param options - Request options bucket.
     * @internal
     */
    _refer(onNotify?: (notification: Notification) => void, delegate?: OutgoingRequestDelegate, options?: RequestOptions): Promise<OutgoingByeRequest>;
    /**
     * Send ACK and then BYE. There are unrecoverable errors which can occur
     * while handling dialog forming and in-dialog INVITE responses and when
     * they occur we ACK the response and send a BYE.
     * Note that the BYE is sent in the dialog associated with the response
     * which is not necessarily `this.dialog`. And, accordingly, the
     * session state is not transitioned to terminated and session is not closed.
     * @param inviteResponse - The response causing the error.
     * @param statusCode - Status code for he reason phrase.
     * @param reasonPhrase - Reason phrase for the BYE.
     * @internal
     */
    protected ackAndBye(response: AckableIncomingResponseWithSession, statusCode?: number, reasonPhrase?: string): void;
    /**
     * Handle in dialog ACK request.
     * @internal
     */
    protected onAckRequest(request: IncomingAckRequest): Promise<void>;
    /**
     * Handle in dialog BYE request.
     * @internal
     */
    protected onByeRequest(request: IncomingByeRequest): void;
    /**
     * Handle in dialog INFO request.
     * @internal
     */
    protected onInfoRequest(request: IncomingInfoRequest): void;
    /**
     * Handle in dialog INVITE request.
     * @internal
     */
    protected onInviteRequest(request: IncomingInviteRequest): void;
    /**
     * Handle in dialog MESSAGE request.
     * @internal
     */
    protected onMessageRequest(request: IncomingMessageRequest): void;
    /**
     * Handle in dialog NOTIFY request.
     * @internal
     */
    protected onNotifyRequest(request: IncomingNotifyRequest): void;
    /**
     * Handle in dialog PRACK request.
     * @internal
     */
    protected onPrackRequest(request: IncomingPrackRequest): void;
    /**
     * Handle in dialog REFER request.
     * @internal
     */
    protected onReferRequest(request: IncomingReferRequest): void;
    /**
     * Generate an offer or answer for a response to an INVITE request.
     * If a remote offer was provided in the request, set the remote
     * description and get a local answer. If a remote offer was not
     * provided, generates a local offer.
     * @internal
     */
    protected generateResponseOfferAnswer(request: IncomingInviteRequest, options: {
        sessionDescriptionHandlerOptions?: SessionDescriptionHandlerOptions;
        sessionDescriptionHandlerModifiers?: Array<SessionDescriptionHandlerModifier>;
    }): Promise<Body | undefined>;
    /**
     * Generate an offer or answer for a response to an INVITE request
     * when a dialog (early or otherwise) has already been established.
     * This method may NOT be called if a dialog has yet to be established.
     * @internal
     */
    protected generateResponseOfferAnswerInDialog(options: {
        sessionDescriptionHandlerOptions?: SessionDescriptionHandlerOptions;
        sessionDescriptionHandlerModifiers?: Array<SessionDescriptionHandlerModifier>;
    }): Promise<Body | undefined>;
    /**
     * Get local offer.
     * @internal
     */
    protected getOffer(options: {
        sessionDescriptionHandlerOptions?: SessionDescriptionHandlerOptions;
        sessionDescriptionHandlerModifiers?: Array<SessionDescriptionHandlerModifier>;
    }): Promise<Body>;
    /**
     * Rollback local/remote offer.
     * @internal
     */
    protected rollbackOffer(): Promise<void>;
    /**
     * Set remote answer.
     * @internal
     */
    protected setAnswer(answer: Body, options: {
        sessionDescriptionHandlerOptions?: SessionDescriptionHandlerOptions;
        sessionDescriptionHandlerModifiers?: Array<SessionDescriptionHandlerModifier>;
    }): Promise<void>;
    /**
     * Set remote offer and get local answer.
     * @internal
     */
    protected setOfferAndGetAnswer(offer: Body, options: {
        sessionDescriptionHandlerOptions?: SessionDescriptionHandlerOptions;
        sessionDescriptionHandlerModifiers?: Array<SessionDescriptionHandlerModifier>;
    }): Promise<Body>;
    /**
     * SDH for confirmed dialog.
     * @internal
     */
    protected setSessionDescriptionHandler(sdh: SessionDescriptionHandler): void;
    /**
     * SDH for confirmed dialog.
     * @internal
     */
    protected setupSessionDescriptionHandler(): SessionDescriptionHandler;
    /**
     * Transition session state.
     * @internal
     */
    protected stateTransition(newState: SessionState): void;
    private copyRequestOptions;
    private getReasonHeaderValue;
    private referExtraHeaders;
    private referToString;
}

/**
 * Session.
 * @remarks
 * https://tools.ietf.org/html/rfc3261#section-13
 * @public
 */
declare interface Session_2 {
    /** Session delegate. */
    delegate: SessionDelegate_2 | undefined;
    /** The session id. Equal to callId + localTag + remoteTag. */
    readonly id: string;
    /** Call Id. */
    readonly callId: string;
    /** Local Tag. */
    readonly localTag: string;
    /** Local URI. */
    readonly localURI: URI;
    /** Remote Tag. */
    readonly remoteTag: string;
    /** Remote Target. */
    readonly remoteTarget: URI;
    /** Remote URI. */
    readonly remoteURI: URI;
    /** Session state. */
    readonly sessionState: SessionState_2;
    /** Current state of the offer/answer exchange. */
    readonly signalingState: SignalingState;
    /** The current answer if signalingState is stable. Otherwise undefined. */
    readonly answer: Body | undefined;
    /** The current offer if signalingState is not initial or closed. Otherwise undefined. */
    readonly offer: Body | undefined;
    /**
     * Destroy session.
     */
    dispose(): void;
    /**
     * Send a BYE request.
     * Terminating a session.
     * https://tools.ietf.org/html/rfc3261#section-15
     * @param delegate - Request delegate.
     * @param options - Options bucket.
     */
    bye(delegate?: OutgoingRequestDelegate, options?: RequestOptions): OutgoingByeRequest;
    /**
     * Send an INFO request.
     * Exchange information during a session.
     * https://tools.ietf.org/html/rfc6086#section-4.2.1
     * @param delegate - Request delegate.
     * @param options - Options bucket.
     */
    info(delegate?: OutgoingRequestDelegate, options?: RequestOptions): OutgoingInfoRequest;
    /**
     * Send re-INVITE request.
     * Modifying a session.
     * https://tools.ietf.org/html/rfc3261#section-14.1
     * @param delegate - Request delegate.
     * @param options - Options bucket.
     */
    invite(delegate?: OutgoingInviteRequestDelegate, options?: RequestOptions): OutgoingInviteRequest;
    /**
     * Send MESSAGE request.
     * Deliver a message during a session.
     * https://tools.ietf.org/html/rfc3428#section-4
     * @param delegate - Request delegate.
     * @param options - Options bucket.
     */
    message(delegate?: OutgoingRequestDelegate, options?: RequestOptions): OutgoingMessageRequest;
    /**
     * Send NOTIFY request.
     * Inform referrer of transfer progress.
     * The use of this is limited to the implicit creation of subscription by REFER (historical).
     * Otherwise, notifiers MUST NOT create subscriptions except upon receipt of a SUBSCRIBE request.
     * https://tools.ietf.org/html/rfc3515#section-3.7
     * @param delegate - Request delegate.
     * @param options - Options bucket.
     */
    notify(delegate?: OutgoingRequestDelegate, options?: RequestOptions): OutgoingNotifyRequest;
    /**
     * Send PRACK request.
     * Acknowledge a reliable provisional response.
     * https://tools.ietf.org/html/rfc3262#section-4
     * @param delegate - Request delegate.
     * @param options - Options bucket.
     */
    prack(delegate?: OutgoingRequestDelegate, options?: RequestOptions): OutgoingPrackRequest;
    /**
     * Send REFER request.
     * Transfer a session.
     * https://tools.ietf.org/html/rfc3515#section-2.4.1
     * @param delegate - Request delegate.
     * @param options - Options bucket.
     */
    refer(delegate?: OutgoingRequestDelegate, options?: RequestOptions): OutgoingReferRequest;
}

/**
 * Options for {@link Session.bye}.
 * @public
 */
export declare interface SessionByeOptions {
    /** See `core` API. */
    requestDelegate?: OutgoingRequestDelegate;
    /** See `core` API. */
    requestOptions?: RequestOptions;
}

/**
 * Delegate for {@link Session}.
 * @public
 */
export declare interface SessionDelegate {
    /**
     * Called upon receiving an incoming in dialog ACK request.
     * @remarks
     * Includes the ACK confirming an accepted initial Invite
     * as well as ACKs associated with in dialog INVITE requests.
     * @param ack - The ack.
     */
    onAck?(ack: Ack): void;
    /**
     * Called upon receiving an incoming in dialog BYE request.
     * @param bye - The bye.
     */
    onBye?(bye: Bye): void;
    /**
     * Called upon receiving an incoming CANCEL request.
     * @remarks
     * Relevant to an Invitation only. CANCEL reqeusts are being handled as
     * a special case and there is currently no way to externally impact the
     * response to the a CANCEL request. See core implementation for details.
     * @param cancel - The cancel.
     */
    onCancel?(cancel: Cancel): void;
    /**
     * Called upon receiving an incoming in dialog INFO request.
     * @param info - The info.
     */
    onInfo?(info: Info): void;
    /**
     * Called upon receiving an incoming in dialog INVITE request.
     * @param invite - The invite.
     */
    onInvite?(request: IncomingRequestMessage, response: string, statusCode: number): void;
    /**
     * Called upon receiving an incoming in dialog MESSAGE request.
     * @param message - The message.
     */
    onMessage?(message: Message): void;
    /**
     * Called upon receiving an incoming in dialog NOTIFY request.
     *
     * @remarks
     * If a refer is in progress notifications are delivered to the referrers delegate.
     *
     * @param notification - The notification.
     */
    onNotify?(notification: Notification): void;
    /**
     * Called upon receiving an incoming in dialog REFER request.
     * @param referral - The referral.
     */
    onRefer?(referral: Referral): void;
    /**
     * Called upon creating a SessionDescriptionHandler.
     *
     * @remarks
     * It's recommended that the SessionDescriptionHandler be accessed via the `Session.sessionDescriptionHandler` property.
     * However there are use cases where one needs access immediately after it is constructed and before it is utilized.
     * Thus this callback.
     *
     * In most scenarios a single SessionDescriptionHandler will be created per Session
     * in which case this callback will be called at most once and `provisional` will be `false`.
     *
     * However if reliable provisional responses are being supported and an INVITE is sent without SDP,
     * one or more session description handlers will be created if remote offers are received in reliable provisional responses.
     * When remote offers are received in reliable provisional responses, the `provisional` parameter will be `true`.
     * When the `provisional` paramter is `true`, this callback may (or may not) be called again.
     * If the session is ultimately established using a SessionDescriptionHandler which was not created provisionally,
     * this callback will be called again and the `provisional` parameter will be `false`.
     * If the session is ultimately established using a SessionDescriptionHandler which was created provisionally,
     * this callback will not be called again.
     * Note that if the session is ultimately established using a SessionDescriptionHandler which was created provisionally,
     * the provisional SessionDescriptionHandler being utilized will be available via the `Session.sessionDescriptionHandler` property.
     *
     * @param sessionDescriptionHandler - The handler.
     * @param provisional - True if created provisionally.
     */
    onSessionDescriptionHandler?(sessionDescriptionHandler: SessionDescriptionHandler, provisional: boolean): void;
}

/**
 * Session delegate.
 * @public
 */
declare interface SessionDelegate_2 {
    /**
     * Receive ACK request.
     * @param request - Incoming ACK request.
     * @returns
     * The callback MUST return a promise if it asynchronously handles answers.
     * For example, an ACK with an answer (offer in the 200 Ok) may require
     * asynchronous processing in which case the callback MUST return a Promise
     * which resolves when the answer handling is complete.
     * @privateRemarks
     * Unlike INVITE handling where we can rely on the generation of a response
     * to indicate when offer/answer processing has been completed, ACK handling
     * requires some indication from the handler that answer processing is complete
     * so that we can avoid some race conditions (see comments in code for more details).
     * Having the handler return a Promise provides said indication.
     */
    onAck?(request: IncomingAckRequest): Promise<void> | void;
    /**
     * Timeout waiting for ACK request.
     * If no handler is provided the Session will terminated with a BYE.
     * https://tools.ietf.org/html/rfc3261#section-13.3.1.4
     */
    onAckTimeout?(): void;
    /**
     * Receive BYE request.
     * https://tools.ietf.org/html/rfc3261#section-15.1.2
     * @param request - Incoming BYE request.
     */
    onBye?(request: IncomingByeRequest): void;
    /**
     * Receive INFO request.
     * @param request - Incoming INFO request.
     */
    onInfo?(request: IncomingInfoRequest): void;
    /**
     * Receive re-INVITE request.
     * https://tools.ietf.org/html/rfc3261#section-14.2
     * @param request - Incoming INVITE request.
     */
    onInvite?(request: IncomingInviteRequest): void;
    /**
     * Receive MESSAGE request.
     * https://tools.ietf.org/html/rfc3428#section-7
     * @param request - Incoming MESSAGE request.
     */
    onMessage?(request: IncomingMessageRequest): void;
    /**
     * Receive NOTIFY request.
     * https://tools.ietf.org/html/rfc6665#section-4.1.3
     * @param request - Incoming NOTIFY request.
     */
    onNotify?(request: IncomingNotifyRequest): void;
    /**
     * Receive PRACK request.
     * https://tools.ietf.org/html/rfc3262#section-3
     * @param request - Incoming PRACK request.
     */
    onPrack?(request: IncomingPrackRequest): void;
    /**
     * Receive REFER request.
     * https://tools.ietf.org/html/rfc3515#section-2.4.2
     * @param request - Incoming REFER request.
     */
    onRefer?(request: IncomingReferRequest): void;
}

/**
 * Delegate for {@link Session} offer/answer exchange.
 * @public
 */
export declare interface SessionDescriptionHandler {
    /**
     * Destructor.
     */
    close(): void;
    /**
     * Gets the local description from the underlying media implementation.
     * @param options - Options object to be used by getDescription.
     * @param modifiers - Array with one time use description modifiers.
     * @returns Promise that resolves with the local description to be used for the session.
     * Rejects with `ClosedSessionDescriptionHandlerError` when this method
     * is called after close or when close occurs before complete.
     */
    getDescription(options?: SessionDescriptionHandlerOptions, modifiers?: Array<SessionDescriptionHandlerModifier>): Promise<BodyAndContentType>;
    /**
     * Returns true if the Session Description Handler can handle the Content-Type described by a SIP message.
     * @param contentType - The content type that is in the SIP Message.
     * @returns True if the content type is  handled by this session description handler. False otherwise.
     */
    hasDescription(contentType: string): boolean;
    /**
     * Rolls back the current local/remote offer to the prior stable state.
     */
    rollbackDescription?(): Promise<void>;
    /**
     * Sets the remote description to the underlying media implementation.
     * @param  sessionDescription - The description provided by a SIP message to be set on the media implementation.
     * @param options - Options object to be used by setDescription.
     * @param modifiers - Array with one time use description modifiers.
     * @returns Promise that resolves once the description is set.
     * Rejects with `ClosedSessionDescriptionHandlerError` when this method
     * is called after close or when close occurs before complete.
     */
    setDescription(sdp: string, options?: SessionDescriptionHandlerOptions, modifiers?: Array<SessionDescriptionHandlerModifier>): Promise<void>;
    /**
     * Send DTMF via RTP (RFC 4733).
     * Returns true if DTMF send is successful, false otherwise.
     * @param tones - A string containing DTMF digits.
     * @param options - Options object to be used by sendDtmf.
     * @returns True if DTMF send is successful, false otherwise.
     */
    sendDtmf(tones: string, options?: unknown): boolean;
}

/**
 * An exception indicating a session description handler error occured.
 * @public
 */
export declare class SessionDescriptionHandlerError extends Exception {
    constructor(message?: string);
}

/**
 * Factory for {@link SessionDescriptionHandler}.
 * @public
 */
export declare interface SessionDescriptionHandlerFactory {
    /**
     * SessionDescriptionHandler factory function.
     * @remarks
     * The `options` are provided as part of the UserAgent configuration
     * and passed through on every call to SessionDescriptionHandlerFactory's constructor.
     */
    (session: Session, options?: object): SessionDescriptionHandler;
}

/**
 * Modifier for {@link SessionDescriptionHandler} offer/answer.
 * @public
 */
export declare interface SessionDescriptionHandlerModifier {
    (sessionDescription: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit>;
}

/**
 * Options for {@link SessionDescriptionHandler} methods.
 * @remarks
 * These options are provided to various UserAgent methods (invite() for example)
 * and passed through on calls to getDescription() and setDescription().
 * @public
 */
export declare interface SessionDescriptionHandlerOptions {
    constraints?: object;
}

/**
 * Options for {@link Session.info}.
 * @public
 */
export declare interface SessionInfoOptions {
    /** See `core` API. */
    requestDelegate?: OutgoingRequestDelegate;
    /** See `core` API. */
    requestOptions?: RequestOptions;
}

/**
 * Options for {@link Session.invite}.
 * @public
 */
export declare interface SessionInviteOptions {
    /**
     * See `core` API.
     */
    requestDelegate?: OutgoingRequestDelegate;
    /**
     * See `core` API.
     */
    requestOptions?: RequestOptions;
    /**
     * Modifiers to pass to SessionDescriptionHandler during re-INVITE transaction.
     */
    sessionDescriptionHandlerModifiers?: Array<SessionDescriptionHandlerModifier>;
    /**
     * Options to pass to SessionDescriptionHandler during re-INVITE transaction.
     */
    sessionDescriptionHandlerOptions?: SessionDescriptionHandlerOptions;
    /**
     * If true, send INVITE without SDP. Default is false.
     */
    withoutSdp?: boolean;
}

/**
 * Options for {@link Session.message}.
 * @public
 */
export declare interface SessionMessageOptions {
    /** See `core` API. */
    requestDelegate?: OutgoingRequestDelegate;
    /** See `core` API. */
    requestOptions?: RequestOptions;
}

/**
 * Options for {@link Session} constructor.
 * @public
 */
export declare interface SessionOptions {
    delegate?: SessionDelegate;
}

/**
 * Options for {@link Session.refer}.
 * @public
 */
export declare interface SessionReferOptions {
    /** Called upon receiving an incoming NOTIFY associated with a REFER. */
    onNotify?: (notification: Notification) => void;
    /** See `core` API. */
    requestDelegate?: OutgoingRequestDelegate;
    /** See `core` API. */
    requestOptions?: RequestOptions;
}

/**
 * {@link Session} state.
 *
 * @remarks
 * The {@link Session} behaves in a deterministic manner according to the following
 * Finite State Machine (FSM).
 * ```txt
 *                   ___________________________________________________________
 *                  |  ____________________________________________             |
 *                  | |            ____________________________    |            |
 * Session          | |           |                            v   v            v
 * Constructed -> Initial -> Establishing -> Established -> Terminating -> Terminated
 *                                |               |___________________________^   ^
 *                                |_______________________________________________|
 * ```
 * @public
 */
export declare enum SessionState {
    /**
     * If `Inviter`, INVITE not sent yet.
     * If `Invitation`, received INVITE (but no final response sent yet).
     */
    Initial = "Initial",
    /**
     * If `Inviter`, sent INVITE and waiting for a final response.
     * If `Invitation`, received INVITE and attempting to send 200 final response (but has not sent it yet).
     */
    Establishing = "Establishing",
    /**
     * If `Inviter`, sent INVITE and received 200 final response and sent ACK.
     * If `Invitation`, received INVITE and sent 200 final response.
     */
    Established = "Established",
    /**
     * If `Inviter`, sent INVITE, sent CANCEL and now waiting for 487 final response to ACK (or 200 to ACK & BYE).
     * If `Invitation`, received INVITE, sent 200 final response and now waiting on ACK and upon receipt will attempt BYE
     * (as the protocol specification requires, before sending a BYE we must receive the ACK - so we are waiting).
     */
    Terminating = "Terminating",
    /**
     * If `Inviter`, sent INVITE and received non-200 final response (or sent/received BYE after receiving 200).
     * If `Invitation`, received INVITE and sent non-200 final response (or sent/received BYE after sending 200).
     */
    Terminated = "Terminated"
}

/**
 * Session state.
 * @remarks
 * https://tools.ietf.org/html/rfc3261#section-13
 * @public
 */
declare enum SessionState_2 {
    Initial = "Initial",
    Early = "Early",
    AckWait = "AckWait",
    Confirmed = "Confirmed",
    Terminated = "Terminated"
}

/**
 * An exception indicating the session terminated before the action completed.
 * @public
 */
export declare class SessionTerminatedError extends Exception {
    constructor();
}

/**
 * Offer/Answer state.
 * @remarks
 * ```txt
 *         Offer                Answer             RFC    Ini Est Early
 *  -------------------------------------------------------------------
 *  1. INVITE Req.          2xx INVITE Resp.     RFC 3261  Y   Y    N
 *  2. 2xx INVITE Resp.     ACK Req.             RFC 3261  Y   Y    N
 *  3. INVITE Req.          1xx-rel INVITE Resp. RFC 3262  Y   Y    N
 *  4. 1xx-rel INVITE Resp. PRACK Req.           RFC 3262  Y   Y    N
 *  5. PRACK Req.           200 PRACK Resp.      RFC 3262  N   Y    Y
 *  6. UPDATE Req.          2xx UPDATE Resp.     RFC 3311  N   Y    Y
 *
 *       Table 1: Summary of SIP Usage of the Offer/Answer Model
 * ```
 * https://tools.ietf.org/html/rfc6337#section-2.2
 * @public
 */
declare enum SignalingState {
    Initial = "Initial",
    HaveLocalOffer = "HaveLocalOffer",
    HaveRemoteOffer = "HaveRemoteOffer",
    Stable = "Stable",
    Closed = "Closed"
}

/**
 * SIP extension support level.
 * @public
 */
export declare enum SIPExtension {
    Required = "Required",
    Supported = "Supported",
    Unsupported = "Unsupported"
}

/**
 * An exception indicating an invalid state transition error occured.
 * @public
 */
export declare class StateTransitionError extends Exception {
    constructor(message?: string);
}

/**
 * A subscriber establishes a {@link Subscription} (outgoing SUBSCRIBE).
 *
 * @remarks
 * This is (more or less) an implementation of a "subscriber" as
 * defined in RFC 6665 "SIP-Specific Event Notifications".
 * https://tools.ietf.org/html/rfc6665
 *
 * @example
 * ```ts
 * // Create a new subscriber.
 * const targetURI = new URI("sip", "alice", "example.com");
 * const eventType = "example-name"; // https://www.iana.org/assignments/sip-events/sip-events.xhtml
 * const subscriber = new Subscriber(userAgent, targetURI, eventType);
 *
 * // Add delegate to handle event notifications.
 * subscriber.delegate = {
 *   onNotify: (notification: Notification) => {
 *     // send a response
 *     notification.accept();
 *     // handle notification here
 *   }
 * };
 *
 * // Monitor subscription state changes.
 * subscriber.stateChange.addListener((newState: SubscriptionState) => {
 *   if (newState === SubscriptionState.Terminated) {
 *     // handle state change here
 *   }
 * });
 *
 * // Attempt to establish the subscription
 * subscriber.subscribe();
 *
 * // Sometime later when done with subscription
 * subscriber.unsubscribe();
 * ```
 *
 * @public
 */
export declare class Subscriber extends Subscription {
    private id;
    private body;
    private event;
    private expires;
    private extraHeaders;
    private logger;
    private outgoingRequestMessage;
    private retryAfterTimer;
    private subscriberRequest;
    private targetURI;
    /**
     * Constructor.
     * @param userAgent - User agent. See {@link UserAgent} for details.
     * @param targetURI - The request URI identifying the subscribed event.
     * @param eventType - The event type identifying the subscribed event.
     * @param options - Options bucket. See {@link SubscriberOptions} for details.
     */
    constructor(userAgent: UserAgent, targetURI: URI, eventType: string, options?: SubscriberOptions);
    /**
     * Destructor.
     * @internal
     */
    dispose(): Promise<void>;
    /**
     * Subscribe to event notifications.
     *
     * @remarks
     * Send an initial SUBSCRIBE request if no subscription as been established.
     * Sends a re-SUBSCRIBE request if the subscription is "active".
     */
    subscribe(options?: SubscriberSubscribeOptions): Promise<void>;
    /**
     * {@inheritDoc Subscription.unsubscribe}
     */
    unsubscribe(options?: SubscriptionUnsubscribeOptions): Promise<void>;
    /**
     * Sends a re-SUBSCRIBE request if the subscription is "active".
     * @deprecated Use `subscribe` instead.
     * @internal
     */
    _refresh(): Promise<void>;
    /** @internal */
    protected onAccepted(response: IncomingResponse): void;
    /** @internal */
    protected onNotify(request: IncomingNotifyRequest): void;
    /** @internal */
    protected onRefresh(request: OutgoingSubscribeRequest): void;
    private initSubscriberRequest;
}

/**
 * Options for {@link Subscriber} constructor.
 * @public
 */
export declare interface SubscriberOptions extends SubscriptionOptions {
    expires?: number;
    extraHeaders?: Array<string>;
    body?: string;
    contentType?: string;
}

/**
 * Options for {@link Subscriber.subscribe}.
 * @public
 */
export declare interface SubscriberSubscribeOptions {
}

/**
 * SUBSCRIBE UAC.
 * @remarks
 * 4.1.  Subscriber Behavior
 * https://tools.ietf.org/html/rfc6665#section-4.1
 *
 * User agent client for installation of a single subscription per SUBSCRIBE request.
 * TODO: Support for installation of multiple subscriptions on forked SUBSCRIBE requests.
 * @public
 */
declare class SubscribeUserAgentClient extends UserAgentClient implements OutgoingSubscribeRequest {
    delegate: OutgoingSubscribeRequestDelegate | undefined;
    /** Dialog created upon receiving the first NOTIFY. */
    private dialog;
    /** Identifier of this user agent client. */
    private subscriberId;
    /** When the subscription expires. Starts as requested expires and updated on 200 and NOTIFY. */
    private subscriptionExpires;
    /** The requested expires for the subscription. */
    private subscriptionExpiresRequested;
    /** Subscription event being targeted. */
    private subscriptionEvent;
    /** Subscription state. */
    private subscriptionState;
    /** Timer N Id. */
    private N;
    constructor(core: UserAgentCore, message: OutgoingRequestMessage, delegate?: OutgoingSubscribeRequestDelegate);
    /**
     * Destructor.
     * Note that Timer N may live on waiting for an initial NOTIFY and
     * the delegate may still receive that NOTIFY. If you don't want
     * that behavior then either clear the delegate so the delegate
     * doesn't get called (a 200 will be sent in response to the NOTIFY)
     * or call `waitNotifyStop` which will clear Timer N and remove this
     * UAC from the core (a 481 will be sent in response to the NOTIFY).
     */
    dispose(): void;
    /**
     * Handle out of dialog NOTIFY associated with SUBSCRIBE request.
     * This is the first NOTIFY received after the SUBSCRIBE request.
     * @param uas - User agent server handling the subscription creating NOTIFY.
     */
    onNotify(uas: NotifyUserAgentServer): void;
    waitNotifyStart(): void;
    waitNotifyStop(): void;
    /**
     * Receive a response from the transaction layer.
     * @param message - Incoming response message.
     */
    protected receiveResponse(message: IncomingResponseMessage): void;
    /**
     * To ensure that subscribers do not wait indefinitely for a
     * subscription to be established, a subscriber starts a Timer N, set to
     * 64*T1, when it sends a SUBSCRIBE request.  If this Timer N expires
     * prior to the receipt of a NOTIFY request, the subscriber considers
     * the subscription failed, and cleans up any state associated with the
     * subscription attempt.
     * https://tools.ietf.org/html/rfc6665#section-4.1.2.4
     */
    private timerN;
}

/**
 * A subscription provides {@link Notification} of events.
 *
 * @remarks
 * See {@link Subscriber} for details on establishing a subscription.
 *
 * @public
 */
export declare abstract class Subscription {
    /**
     * Property reserved for use by instance owner.
     * @defaultValue `undefined`
     */
    data: unknown;
    /**
     * Subscription delegate. See {@link SubscriptionDelegate} for details.
     * @defaultValue `undefined`
     */
    delegate: SubscriptionDelegate | undefined;
    /**
     * If the subscription state is SubscriptionState.Subscribed, the associated subscription dialog. Otherwise undefined.
     * @internal
     */
    protected _dialog: Subscription_2 | undefined;
    /**
     * Our user agent.
     * @internal
     */
    protected _userAgent: UserAgent;
    private _disposed;
    private _logger;
    private _state;
    private _stateEventEmitter;
    /**
     * Constructor.
     * @param userAgent - User agent. See {@link UserAgent} for details.
     * @internal
     */
    protected constructor(userAgent: UserAgent, options?: SubscriptionOptions);
    /**
     * Destructor.
     */
    dispose(): Promise<void>;
    /**
     * The subscribed subscription dialog.
     */
    get dialog(): Subscription_2 | undefined;
    /**
     * True if disposed.
     * @internal
     */
    get disposed(): boolean;
    /**
     * Subscription state. See {@link SubscriptionState} for details.
     */
    get state(): SubscriptionState;
    /**
     * Emits when the subscription `state` property changes.
     */
    get stateChange(): Emitter<SubscriptionState>;
    /** @internal */
    protected stateTransition(newState: SubscriptionState): void;
    /**
     * Sends a re-SUBSCRIBE request if the subscription is "active".
     */
    abstract subscribe(options?: SubscriptionSubscribeOptions): Promise<void>;
    /**
     * Unsubscribe from event notifications.
     *
     * @remarks
     * If the subscription state is SubscriptionState.Subscribed, sends an in dialog SUBSCRIBE request
     * with expires time of zero (an un-subscribe) and terminates the subscription.
     * Otherwise a noop.
     */
    abstract unsubscribe(options?: SubscriptionUnsubscribeOptions): Promise<void>;
}

/**
 * Subscription.
 * @remarks
 * https://tools.ietf.org/html/rfc6665
 * @public
 */
declare interface Subscription_2 {
    /** Subscription delegate. */
    delegate: SubscriptionDelegate_2 | undefined;
    /** The subscription id. */
    readonly id: string;
    /** Subscription expires. Number of seconds until the subscription expires. */
    readonly subscriptionExpires: number;
    /** Subscription state. */
    readonly subscriptionState: SubscriptionState_2;
    /** If true, refresh subscription prior to expiration. Default is false. */
    autoRefresh: boolean;
    /**
     * Destroy subscription.
     */
    dispose(): void;
    /**
     * Send re-SUBSCRIBE request.
     * Refreshing a subscription and unsubscribing.
     * https://tools.ietf.org/html/rfc6665#section-4.1.2.2
     * @param delegate - Request delegate.
     * @param options - Options bucket
     */
    subscribe(delegate?: OutgoingSubscribeRequestDelegate, options?: RequestOptions): OutgoingSubscribeRequest;
    /**
     * 4.1.2.2.  Refreshing of Subscriptions
     * https://tools.ietf.org/html/rfc6665#section-4.1.2.2
     */
    refresh(): OutgoingSubscribeRequest;
    /**
     * 4.1.2.3.  Unsubscribing
     * https://tools.ietf.org/html/rfc6665#section-4.1.2.3
     */
    unsubscribe(): OutgoingSubscribeRequest;
}

/**
 * Delegate for {@link Subscription}.
 * @public
 */
export declare interface SubscriptionDelegate {
    /**
     * Called upon receiving an incoming NOTIFY request.
     * @param notification - A notification. See {@link Notification} for details.
     */
    onNotify(notification: Notification): void;
}

/**
 * Subscription delegate.
 * @public
 */
declare interface SubscriptionDelegate_2 {
    /**
     * Receive NOTIFY request. This includes in dialog NOTIFY requests only.
     * Thus the first NOTIFY (the subscription creating NOTIFY) will not be provided.
     * https://tools.ietf.org/html/rfc6665#section-4.1.3
     * @param request - Incoming NOTIFY request.
     */
    onNotify?(request: IncomingNotifyRequest): void;
    /**
     * Sent a SUBSCRIBE request. This includes "auto refresh" in dialog SUBSCRIBE requests only.
     * Thus SUBSCRIBE requests triggered by calls to `refresh()` or `subscribe()` will not be provided.
     * Thus the first SUBSCRIBE (the subscription creating SUBSCRIBE) will not be provided.
     * @param request - Outgoing SUBSCRIBE request.
     */
    onRefresh?(request: OutgoingSubscribeRequest): void;
    /**
     * Subscription termination. This includes non-NOTIFY termination causes only.
     * Thus this will not be called if a NOTIFY is the cause of termination.
     * https://tools.ietf.org/html/rfc6665#section-4.4.1
     */
    onTerminated?(): void;
}

/**
 * Options for {@link Subscription } constructor.
 * @public
 */
export declare interface SubscriptionOptions {
    delegate?: SubscriptionDelegate;
}

/**
 * {@link Subscription} state.
 * @remarks
 * The {@link Subscription} behaves in a deterministic manner according to the following
 * Finite State Machine (FSM).
 * ```txt
 *                    _______________________________________
 * Subscription      |                                       v
 * Constructed -> Initial -> NotifyWait -> Subscribed -> Terminated
 *                              |____________________________^
 * ```
 * @public
 */
export declare enum SubscriptionState {
    Initial = "Initial",
    NotifyWait = "NotifyWait",
    Subscribed = "Subscribed",
    Terminated = "Terminated"
}

/**
 * Subscription state.
 * @remarks
 * https://tools.ietf.org/html/rfc6665#section-4.1.2
 * @public
 */
declare enum SubscriptionState_2 {
    Initial = "Initial",
    NotifyWait = "NotifyWait",
    Pending = "Pending",
    Active = "Active",
    Terminated = "Terminated"
}

/**
 * Options for {@link Subscription.subscribe}.
 * @public
 */
export declare interface SubscriptionSubscribeOptions {
}

/**
 * Options for {@link Subscription.unsubscribe}.
 * @public
 */
export declare interface SubscriptionUnsubscribeOptions {
}

/**
 * Transaction.
 * @remarks
 * SIP is a transactional protocol: interactions between components take
 * place in a series of independent message exchanges.  Specifically, a
 * SIP transaction consists of a single request and any responses to
 * that request, which include zero or more provisional responses and
 * one or more final responses.  In the case of a transaction where the
 * request was an INVITE (known as an INVITE transaction), the
 * transaction also includes the ACK only if the final response was not
 * a 2xx response.  If the response was a 2xx, the ACK is not considered
 * part of the transaction.
 * https://tools.ietf.org/html/rfc3261#section-17
 * @public
 */
declare abstract class Transaction {
    private _transport;
    private _user;
    private _id;
    private _state;
    protected logger: Logger;
    private listeners;
    protected constructor(_transport: Transport_2, _user: TransactionUser, _id: string, _state: TransactionState, loggerCategory: string);
    /**
     * Destructor.
     * Once the transaction is in the "terminated" state, it is destroyed
     * immediately and there is no need to call `dispose`. However, if a
     * transaction needs to be ended prematurely, the transaction user may
     * do so by calling this method (for example, perhaps the UA is shutting down).
     * No state transition will occur upon calling this method, all outstanding
     * transmission timers will be cancelled, and use of the transaction after
     * calling `dispose` is undefined.
     */
    dispose(): void;
    /** Transaction id. */
    get id(): string;
    /** Transaction kind. Deprecated. */
    get kind(): string;
    /** Transaction state. */
    get state(): TransactionState;
    /** Transaction transport. */
    get transport(): Transport_2;
    /**
     * Sets up a function that will be called whenever the transaction state changes.
     * @param listener - Callback function.
     * @param options - An options object that specifies characteristics about the listener.
     *                  If once true, indicates that the listener should be invoked at most once after being added.
     *                  If once true, the listener would be automatically removed when invoked.
     */
    addStateChangeListener(listener: () => void, options?: {
        once?: boolean;
    }): void;
    /**
     * This is currently public so tests may spy on it.
     * @internal
     */
    notifyStateChangeListeners(): void;
    /**
     * Removes a listener previously registered with addStateListener.
     * @param listener - Callback function.
     */
    removeStateChangeListener(listener: () => void): void;
    protected logTransportError(error: TransportError, message: string): void;
    /**
     * Pass message to transport for transmission. If transport fails,
     * the transaction user is notified by callback to onTransportError().
     * @returns
     * Rejects with `TransportError` if transport fails.
     */
    protected send(message: string): Promise<void>;
    protected setState(state: TransactionState): void;
    protected typeToString(): string;
    protected abstract onTransportError(error: TransportError): void;
}

/**
 * Transaction state.
 * @public
 */
declare enum TransactionState {
    Accepted = "Accepted",
    Calling = "Calling",
    Completed = "Completed",
    Confirmed = "Confirmed",
    Proceeding = "Proceeding",
    Terminated = "Terminated",
    Trying = "Trying"
}

/**
 * Transaction User (TU).
 * @remarks
 * The layer of protocol processing that resides above the transaction layer.
 * Transaction users include the UAC core, UAS core, and proxy core.
 * https://tools.ietf.org/html/rfc3261#section-5
 * https://tools.ietf.org/html/rfc3261#section-6
 * @public
 */
declare interface TransactionUser {
    /**
     * Logger factory.
     */
    loggerFactory: LoggerFactory;
    /**
     * Callback for notification of transaction state changes.
     *
     * Not called when transaction is constructed, so there is
     * no notification of entering the initial transaction state.
     * Otherwise, called once for each transaction state change.
     * State changes adhere to the following RFCs.
     * https://tools.ietf.org/html/rfc3261#section-17
     * https://tools.ietf.org/html/rfc6026
     */
    onStateChange?: (newState: TransactionState) => void;
    /**
     * Callback for notification of a transport error.
     *
     * If a fatal transport error is reported by the transport layer
     * (generally, due to fatal ICMP errors in UDP or connection failures in
     * TCP), the condition MUST be treated as a 503 (Service Unavailable)
     * status code.
     * https://tools.ietf.org/html/rfc3261#section-8.1.3.1
     * https://tools.ietf.org/html/rfc3261#section-17.1.4
     * https://tools.ietf.org/html/rfc3261#section-17.2.4
     * https://tools.ietf.org/html/rfc6026
     */
    onTransportError?: (error: TransportError) => void;
}

/**
 * Transport layer interface expected by the `UserAgent`.
 *
 * @remarks
 * The transport behaves in a deterministic manner according to the
 * the state defined in {@link TransportState}.
 *
 * The "Connecting" state is ONLY entered in response to the user calling `connect()`.
 * The "Disconnecting" state is ONLY entered in response to the user calling `disconnect()`.
 * The `onConnect` callback is ALWAYS called upon transitioning to the "Connected" state.
 * The `onDisconnect` callback is ALWAYS called upon transitioning from the "Connected" state.
 *
 * Adherence to the state machine by the transport implementation is critical as the
 * UserAgent depends on this behavior. Furthermore it is critical that the transport
 * transition to the "Disconnected" state in all instances where network connectivity
 * is lost as the UserAgent, API, and application layer more generally depend on knowing
 * network was lost. For example, from a practical standpoint registrations and subscriptions are invalidated
 * when network is lost - particularly in the case of connection oriented transport
 * protocols such as a secure WebSocket transport.
 *
 * Proper handling the application level protocol recovery must be left to the application layer,
 * thus the transport MUST NOT attempt to "auto-recover" from or otherwise hide loss of network.
 * Note that callbacks and emitters such as `onConnect`  and `onDisconnect` MUST NOT call methods
 * `connect()` and `direct()` synchronously (state change handlers must not loop back). They may
 * however do so asynchronously using a Promise resolution, `setTimeout`, or some other method.
 * For example...
 * ```ts
 * transport.onDisconnect = () => {
 *   Promise.resolve().then(() => transport.connect());
 * }
 * ```
 * @public
 */
export declare interface Transport extends Transport_2 {
    /**
     * Transport state.
     *
     * @remarks
     * The initial Transport state MUST be "disconnected" (after calling constructor).
     */
    readonly state: TransportState;
    /**
     * Transport state change emitter.
     */
    readonly stateChange: Emitter<TransportState>;
    /**
     * Callback on state transition to "Connected".
     *
     * @remarks
     * When the `UserAgent` is constructed, this property is set.
     * ```txt
     * - The `state` MUST be "Connected" when called.
     * ```
     */
    onConnect: (() => void) | undefined;
    /**
     * Callback on state transition from "Connected".
     *
     * @remarks
     * When the `UserAgent` is constructed, this property is set.
     * ```txt
     * - The `state` MUST NOT "Connected" when called.
     * - If prior `state` is "Connecting" or "Connected", `error` MUST be defined.
     * - If prior `state` is "Disconnecting", `error` MUST NOT be undefined.
     * ```
     * If the transition from "Connected" occurs because the transport
     * user requested it by calling `disconnect`, then `error` will be undefined.
     * Otherwise `error` will be defined to provide an indication that the
     * transport initiated the transition from "Connected" - for example,
     * perhaps network connectivity was lost.
     */
    onDisconnect: ((error?: Error) => void) | undefined;
    /**
     * Callback on receipt of a message.
     *
     * @remarks
     * When the `UserAgent` is constructed, this property is set.
     * The `state` MUST be "Connected" when this is called.
     */
    onMessage: ((message: string) => void) | undefined;
    /**
     * Connect to network.
     *
     * @remarks
     * ```txt
     * - If `state` is "Connecting", `state` MUST NOT transition before returning.
     * - If `state` is "Connected", `state` MUST NOT transition before returning.
     * - If `state` is "Disconnecting", `state` MUST transition to "Connecting" before returning.
     * - If `state` is "Disconnected" `state` MUST transition to "Connecting" before returning.
     * - The `state` MUST transition to "Connected" before resolving (assuming `state` is not already "Connected").
     * - The `state` MUST transition to "Disconnecting" or "Disconnected" before rejecting and MUST reject with an Error.
     * ```
     * Resolves when the transport connects. Rejects if transport fails to connect.
     * Rejects with {@link StateTransitionError} if a loop is detected.
     * In particular, callbacks and emitters MUST NOT call this method synchronously.
     */
    connect(): Promise<void>;
    /**
     * Disconnect from network.
     *
     * @remarks
     * ```txt
     * - If `state` is "Connecting", `state` MUST transition to "Disconnecting" before returning.
     * - If `state` is "Connected", `state` MUST transition to "Disconnecting" before returning.
     * - If `state` is "Disconnecting", `state` MUST NOT transition before returning.
     * - If `state` is "Disconnected", `state` MUST NOT transition before returning.
     * - The `state` MUST transition to "Disconnected" before resolving (assuming `state` is not already "Disconnected").
     * - The `state` MUST transition to "Connecting" or "Connected" before rejecting and MUST reject with an Error.
     * ```
     * Resolves when the transport disconnects. Rejects if transport fails to disconnect.
     * Rejects with {@link StateTransitionError} if a loop is detected.
     * In particular, callbacks and emitters MUST NOT call this method synchronously.
     */
    disconnect(): Promise<void>;
    /**
     * Dispose.
     *
     * @remarks
     * When the `UserAgent` is disposed or stopped, this method is called.
     * The `UserAgent` MUST NOT continue to utilize the instance after calling this method.
     */
    dispose(): Promise<void>;
    /**
     * Returns true if the `state` equals "Connected".
     *
     * @remarks
     * This is equivalent to `state === TransportState.Connected`.
     * It is convenient. A common paradigm is, for example...
     *
     * @example
     * ```ts
     * // Monitor transport connectivity
     * userAgent.transport.stateChange.addListener(() => {
     *   if (userAgent.transport.isConnected()) {
     *     // handle transport connect
     *   } else {
     *     // handle transport disconnect
     *   }
     * });
     * ```
     */
    isConnected(): boolean;
    /**
     * Send a message.
     *
     * @remarks
     * ```txt
     * - If `state` is "Connecting", rejects with an Error.
     * - If `state` is "Connected", resolves when the message is sent otherwise rejects with an Error.
     * - If `state` is "Disconnecting", rejects with an Error.
     * - If `state` is "Disconnected", rejects with an Error.
     * ```
     * @param message - Message to send.
     */
    send(message: string): Promise<void>;
}

/**
 * Transport layer interface expected by the user agent core.
 *
 * @remarks
 * The transport layer is responsible for the actual transmission of
 * requests and responses over network transports.  This includes
 * determination of the connection to use for a request or response in
 * the case of connection-oriented transports.
 * https://tools.ietf.org/html/rfc3261#section-18
 *
 * @public
 */
declare interface Transport_2 {
    /**
     * The transport protocol.
     *
     * @remarks
     * Formatted as defined for the Via header sent-protocol transport.
     * https://tools.ietf.org/html/rfc3261#section-20.42
     */
    readonly protocol: string;
    /**
     * Send a message.
     *
     * @remarks
     * Resolves once message is sent. Otherwise rejects with an Error.
     *
     * @param message - Message to send.
     */
    send(message: string): Promise<void>;
}

/**
 * Transport error.
 * @public
 */
declare class TransportError extends Exception {
    constructor(message?: string);
}

/**
 * {@link Transport} state.
 *
 * @remarks
 * The {@link Transport} behaves in a deterministic manner according to the following
 * Finite State Machine (FSM).
 * ```txt
 *                    ______________________________
 *                   |    ____________              |
 * Transport         v   v            |             |
 * Constructed -> Disconnected -> Connecting -> Connected -> Disconnecting
 *                     ^            ^    |_____________________^  |  |
 *                     |            |_____________________________|  |
 *                     |_____________________________________________|
 * ```
 * @public
 */
export declare enum TransportState {
    /**
     * The `connect()` method was called.
     */
    Connecting = "Connecting",
    /**
     * The `connect()` method resolved.
     */
    Connected = "Connected",
    /**
     * The `disconnect()` method was called.
     */
    Disconnecting = "Disconnecting",
    /**
     * The `connect()` method was rejected, or
     * the `disconnect()` method completed, or
     * network connectivity was lost.
     */
    Disconnected = "Disconnected"
}

/**
 * URI.
 * @public
 */
declare class URI extends Parameters {
    headers: {
        [name: string]: Array<string>;
    };
    private normal;
    private raw;
    /**
     * Constructor
     * @param scheme -
     * @param user -
     * @param host -
     * @param port -
     * @param parameters -
     * @param headers -
     */
    constructor(scheme: string | undefined, user: string, host: string, port?: number, parameters?: {
        [name: string]: string | number | null;
    }, headers?: {
        [name: string]: Array<string>;
    });
    get scheme(): string;
    set scheme(value: string);
    get user(): string | undefined;
    set user(value: string | undefined);
    get host(): string;
    set host(value: string);
    get aor(): string;
    get port(): number | undefined;
    set port(value: number | undefined);
    setHeader(name: string, value: Array<string> | string): void;
    getHeader(name: string): Array<string> | undefined;
    hasHeader(name: string): boolean;
    deleteHeader(header: string): Array<string> | undefined;
    clearHeaders(): void;
    clone(): URI;
    toRaw(): string;
    toString(): string;
    private get _normal();
    private get _raw();
    private _toString;
    private escapeUser;
    private headerize;
}

/**
 * A user agent sends and receives requests using a `Transport`.
 *
 * @remarks
 * A user agent (UA) is associated with a user via the user's SIP address of record (AOR)
 * and acts on behalf of that user to send and receive SIP requests. The user agent can
 * register to receive incoming requests, as well as create and send outbound messages.
 * The user agent also maintains the Transport over which its signaling travels.
 *
 * @public
 */
export declare class UserAgent {
    /**
     * Property reserved for use by instance owner.
     * @defaultValue `undefined`
     */
    data: unknown;
    /**
     * Delegate.
     */
    delegate: UserAgentDelegate | undefined;
    /** @internal */
    _publishers: {
        [id: string]: Publisher;
    };
    /** @internal */
    _registerers: {
        [id: string]: Registerer;
    };
    /** @internal */
    _sessions: {
        [id: string]: Session;
    };
    /** @internal */
    _subscriptions: {
        [id: string]: Subscription;
    };
    private _contact;
    private _instanceId;
    private _state;
    private _stateEventEmitter;
    private _transport;
    private _userAgentCore;
    /** Logger. */
    private logger;
    /** LoggerFactory. */
    private loggerFactory;
    /** Options. */
    private options;
    /**
     * Constructs a new instance of the `UserAgent` class.
     * @param options - Options bucket. See {@link UserAgentOptions} for details.
     */
    constructor(options?: Partial<UserAgentOptions>);
    /**
     * Create a URI instance from a string.
     * @param uri - The string to parse.
     *
     * @remarks
     * Returns undefined if the syntax of the URI is invalid.
     * The syntax must conform to a SIP URI as defined in the RFC.
     * 25 Augmented BNF for the SIP Protocol
     * https://tools.ietf.org/html/rfc3261#section-25
     *
     * @example
     * ```ts
     * const uri = UserAgent.makeURI("sip:edgar@example.com");
     * ```
     */
    static makeURI(uri: string): URI | undefined;
    /** Default user agent options. */
    private static defaultOptions;
    private static newUUID;
    /**
     * Strip properties with undefined values from options.
     * This is a work around while waiting for missing vs undefined to be addressed (or not)...
     * https://github.com/Microsoft/TypeScript/issues/13195
     * @param options - Options to reduce
     */
    private static stripUndefinedProperties;
    /**
     * User agent configuration.
     */
    get configuration(): Required<UserAgentOptions>;
    /**
     * User agent contact.
     */
    get contact(): Contact;
    /**
     * User agent instance id.
     */
    get instanceId(): string;
    /**
     * User agent state.
     */
    get state(): UserAgentState;
    /**
     * User agent state change emitter.
     */
    get stateChange(): Emitter<UserAgentState>;
    /**
     * User agent transport.
     */
    get transport(): Transport;
    /**
     * User agent core.
     */
    get userAgentCore(): UserAgentCore;
    /**
     * The logger.
     */
    getLogger(category: string, label?: string): Logger;
    /**
     * The logger factory.
     */
    getLoggerFactory(): LoggerFactory;
    /**
     * True if transport is connected.
     */
    isConnected(): boolean;
    /**
     * Reconnect the transport.
     */
    reconnect(): Promise<void>;
    /**
     * Start the user agent.
     *
     * @remarks
     * Resolves if transport connects, otherwise rejects.
     * Calling `start()` after calling `stop()` will fail if `stop()` has yet to resolve.
     *
     * @example
     * ```ts
     * userAgent.start()
     *   .then(() => {
     *     // userAgent.isConnected() === true
     *   })
     *   .catch((error: Error) => {
     *     // userAgent.isConnected() === false
     *   });
     * ```
     */
    start(): Promise<void>;
    /**
     * Stop the user agent.
     *
     * @remarks
     * Resolves when the user agent has completed a graceful shutdown.
     * ```txt
     * 1) Sessions terminate.
     * 2) Registerers unregister.
     * 3) Subscribers unsubscribe.
     * 4) Publishers unpublish.
     * 5) Transport disconnects.
     * 6) User Agent Core resets.
     * ```
     * The user agent state transistions to stopped once these steps have been completed.
     * Calling `start()` after calling `stop()` will fail if `stop()` has yet to resolve.
     *
     * NOTE: While this is a "graceful shutdown", it can also be very slow one if you
     * are waiting for the returned Promise to resolve. The disposal of the clients and
     * dialogs is done serially - waiting on one to finish before moving on to the next.
     * This can be slow if there are lot of subscriptions to unsubscribe for example.
     *
     * THE SLOW PACE IS INTENTIONAL!
     * While one could spin them all down in parallel, this could slam the remote server.
     * It is bad practice to denial of service attack (DoS attack) servers!!!
     * Moreover, production servers will automatically blacklist clients which send too
     * many requests in too short a period of time - dropping any additional requests.
     *
     * If a different approach to disposing is needed, one can implement whatever is
     * needed and execute that prior to calling `stop()`. Alternatively one may simply
     * not wait for the Promise returned by `stop()` to complete.
     */
    stop(): Promise<void>;
    /**
     * Used to avoid circular references.
     * @internal
     */
    _makeInviter(targetURI: URI, options?: InviterOptions): Inviter;
    /**
     * Attempt reconnection up to `maxReconnectionAttempts` times.
     * @param reconnectionAttempt - Current attempt number.
     */
    private attemptReconnection;
    /**
     * Initialize contact.
     */
    private initContact;
    /**
     * Initialize user agent core.
     */
    private initCore;
    private initTransportCallbacks;
    private onTransportConnect;
    private onTransportDisconnect;
    private onTransportMessage;
    /**
     * Transition state.
     */
    private transitionState;
}

/**
 * User Agent Client (UAC).
 * @remarks
 * A user agent client is a logical entity
 * that creates a new request, and then uses the client
 * transaction state machinery to send it.  The role of UAC lasts
 * only for the duration of that transaction.  In other words, if
 * a piece of software initiates a request, it acts as a UAC for
 * the duration of that transaction.  If it receives a request
 * later, it assumes the role of a user agent server for the
 * processing of that transaction.
 * https://tools.ietf.org/html/rfc3261#section-6
 * @public
 */
declare class UserAgentClient implements OutgoingRequest {
    private transactionConstructor;
    protected core: UserAgentCore;
    message: OutgoingRequestMessage;
    delegate?: OutgoingRequestDelegate | undefined;
    protected logger: Logger;
    private _transaction;
    private credentials;
    private challenged;
    private stale;
    constructor(transactionConstructor: ClientTransactionConstructor, core: UserAgentCore, message: OutgoingRequestMessage, delegate?: OutgoingRequestDelegate | undefined);
    dispose(): void;
    get loggerFactory(): LoggerFactory;
    /** The transaction associated with this request. */
    get transaction(): ClientTransaction;
    /**
     * Since requests other than INVITE are responded to immediately, sending a
     * CANCEL for a non-INVITE request would always create a race condition.
     * A CANCEL request SHOULD NOT be sent to cancel a request other than INVITE.
     * https://tools.ietf.org/html/rfc3261#section-9.1
     * @param options - Cancel options bucket.
     */
    cancel(reason?: string, options?: RequestOptions): OutgoingRequestMessage;
    /**
     * If a 401 (Unauthorized) or 407 (Proxy Authentication Required)
     * response is received, the UAC SHOULD follow the authorization
     * procedures of Section 22.2 and Section 22.3 to retry the request with
     * credentials.
     * https://tools.ietf.org/html/rfc3261#section-8.1.3.5
     * 22 Usage of HTTP Authentication
     * https://tools.ietf.org/html/rfc3261#section-22
     * 22.1 Framework
     * https://tools.ietf.org/html/rfc3261#section-22.1
     * 22.2 User-to-User Authentication
     * https://tools.ietf.org/html/rfc3261#section-22.2
     * 22.3 Proxy-to-User Authentication
     * https://tools.ietf.org/html/rfc3261#section-22.3
     *
     * FIXME: This "guard for and retry the request with credentials"
     * implementation is not complete and at best minimally passable.
     * @param response - The incoming response to guard.
     * @param dialog - If defined, the dialog within which the response was received.
     * @returns True if the program execution is to continue in the branch in question.
     *          Otherwise the request is retried with credentials and current request processing must stop.
     */
    protected authenticationGuard(message: IncomingResponseMessage, dialog?: Dialog): boolean;
    /**
     * 8.1.3.1 Transaction Layer Errors
     * In some cases, the response returned by the transaction layer will
     * not be a SIP message, but rather a transaction layer error.  When a
     * timeout error is received from the transaction layer, it MUST be
     * treated as if a 408 (Request Timeout) status code has been received.
     * If a fatal transport error is reported by the transport layer
     * (generally, due to fatal ICMP errors in UDP or connection failures in
     * TCP), the condition MUST be treated as a 503 (Service Unavailable)
     * status code.
     * https://tools.ietf.org/html/rfc3261#section-8.1.3.1
     */
    protected onRequestTimeout(): void;
    /**
     * 8.1.3.1 Transaction Layer Errors
     * In some cases, the response returned by the transaction layer will
     * not be a SIP message, but rather a transaction layer error.  When a
     * timeout error is received from the transaction layer, it MUST be
     * treated as if a 408 (Request Timeout) status code has been received.
     * If a fatal transport error is reported by the transport layer
     * (generally, due to fatal ICMP errors in UDP or connection failures in
     * TCP), the condition MUST be treated as a 503 (Service Unavailable)
     * status code.
     * https://tools.ietf.org/html/rfc3261#section-8.1.3.1
     * @param error - Transport error
     */
    protected onTransportError(error: TransportError): void;
    /**
     * Receive a response from the transaction layer.
     * @param message - Incoming response message.
     */
    protected receiveResponse(message: IncomingResponseMessage): void;
    private init;
}

/**
 * User Agent Core.
 * @remarks
 * Core designates the functions specific to a particular type
 * of SIP entity, i.e., specific to either a stateful or stateless
 * proxy, a user agent or registrar.  All cores, except those for
 * the stateless proxy, are transaction users.
 * https://tools.ietf.org/html/rfc3261#section-6
 *
 * UAC Core: The set of processing functions required of a UAC that
 * reside above the transaction and transport layers.
 * https://tools.ietf.org/html/rfc3261#section-6
 *
 * UAS Core: The set of processing functions required at a UAS that
 * resides above the transaction and transport layers.
 * https://tools.ietf.org/html/rfc3261#section-6
 * @public
 */
declare class UserAgentCore {
    /** Configuration. */
    configuration: UserAgentCoreConfiguration;
    /** Delegate. */
    delegate: UserAgentCoreDelegate;
    /** Dialogs. */
    dialogs: Map<string, Dialog>;
    /** Subscribers. */
    subscribers: Map<string, SubscribeUserAgentClient>;
    /** UACs. */
    userAgentClients: Map<string, UserAgentClient>;
    /** UASs. */
    userAgentServers: Map<string, UserAgentServer>;
    private logger;
    /**
     * Constructor.
     * @param configuration - Configuration.
     * @param delegate - Delegate.
     */
    constructor(configuration: UserAgentCoreConfiguration, delegate?: UserAgentCoreDelegate);
    /** Destructor. */
    dispose(): void;
    /** Reset. */
    reset(): void;
    /** Logger factory. */
    get loggerFactory(): LoggerFactory;
    /** Transport. */
    get transport(): Transport_2;
    /**
     * Send INVITE.
     * @param request - Outgoing request.
     * @param delegate - Request delegate.
     */
    invite(request: OutgoingRequestMessage, delegate?: OutgoingInviteRequestDelegate): OutgoingInviteRequest;
    /**
     * Send MESSAGE.
     * @param request - Outgoing request.
     * @param delegate - Request delegate.
     */
    message(request: OutgoingRequestMessage, delegate?: OutgoingRequestDelegate): OutgoingMessageRequest;
    /**
     * Send PUBLISH.
     * @param request - Outgoing request.
     * @param delegate - Request delegate.
     */
    publish(request: OutgoingRequestMessage, delegate?: OutgoingRequestDelegate): OutgoingPublishRequest;
    /**
     * Send REGISTER.
     * @param request - Outgoing request.
     * @param delegate - Request delegate.
     */
    register(request: OutgoingRequestMessage, delegate?: OutgoingRequestDelegate): OutgoingRegisterRequest;
    /**
     * Send SUBSCRIBE.
     * @param request - Outgoing request.
     * @param delegate - Request delegate.
     */
    subscribe(request: OutgoingRequestMessage, delegate?: OutgoingSubscribeRequestDelegate): OutgoingSubscribeRequest;
    /**
     * Send a request.
     * @param request - Outgoing request.
     * @param delegate - Request delegate.
     */
    request(request: OutgoingRequestMessage, delegate?: OutgoingRequestDelegate): OutgoingRequest;
    /**
     * Outgoing request message factory function.
     * @param method - Method.
     * @param requestURI - Request-URI.
     * @param fromURI - From URI.
     * @param toURI - To URI.
     * @param options - Request options.
     * @param extraHeaders - Extra headers to add.
     * @param body - Message body.
     */
    makeOutgoingRequestMessage(method: string, requestURI: URI, fromURI: URI, toURI: URI, options: OutgoingRequestMessageOptions, extraHeaders?: Array<string>, body?: Body): OutgoingRequestMessage;
    /**
     * Handle an incoming request message from the transport.
     * @param message - Incoming request message from transport layer.
     */
    receiveIncomingRequestFromTransport(message: IncomingRequestMessage): void;
    /**
     * Handle an incoming response message from the transport.
     * @param message - Incoming response message from transport layer.
     */
    receiveIncomingResponseFromTransport(message: IncomingResponseMessage): void;
    /**
     * A stateless UAS is a UAS that does not maintain transaction state.
     * It replies to requests normally, but discards any state that would
     * ordinarily be retained by a UAS after a response has been sent.  If a
     * stateless UAS receives a retransmission of a request, it regenerates
     * the response and re-sends it, just as if it were replying to the first
     * instance of the request. A UAS cannot be stateless unless the request
     * processing for that method would always result in the same response
     * if the requests are identical. This rules out stateless registrars,
     * for example.  Stateless UASs do not use a transaction layer; they
     * receive requests directly from the transport layer and send responses
     * directly to the transport layer.
     * https://tools.ietf.org/html/rfc3261#section-8.2.7
     * @param message - Incoming request message to reply to.
     * @param statusCode - Status code to reply with.
     */
    replyStateless(message: IncomingRequestMessage, options: ResponseOptions): OutgoingResponse;
    /**
     * In Section 18.2.1, replace the last paragraph with:
     *
     * Next, the server transport attempts to match the request to a
     * server transaction.  It does so using the matching rules described
     * in Section 17.2.3.  If a matching server transaction is found, the
     * request is passed to that transaction for processing.  If no match
     * is found, the request is passed to the core, which may decide to
     * construct a new server transaction for that request.
     * https://tools.ietf.org/html/rfc6026#section-8.10
     * @param message - Incoming request message from transport layer.
     */
    private receiveRequestFromTransport;
    /**
     * UAC and UAS procedures depend strongly on two factors.  First, based
     * on whether the request or response is inside or outside of a dialog,
     * and second, based on the method of a request.  Dialogs are discussed
     * thoroughly in Section 12; they represent a peer-to-peer relationship
     * between user agents and are established by specific SIP methods, such
     * as INVITE.
     * @param message - Incoming request message.
     */
    private receiveRequest;
    /**
     * Once a dialog has been established between two UAs, either of them
     * MAY initiate new transactions as needed within the dialog.  The UA
     * sending the request will take the UAC role for the transaction.  The
     * UA receiving the request will take the UAS role.  Note that these may
     * be different roles than the UAs held during the transaction that
     * established the dialog.
     * https://tools.ietf.org/html/rfc3261#section-12.2
     * @param message - Incoming request message.
     */
    private receiveInsideDialogRequest;
    /**
     * Assuming all of the checks in the previous subsections are passed,
     * the UAS processing becomes method-specific.
     *  https://tools.ietf.org/html/rfc3261#section-8.2.5
     * @param message - Incoming request message.
     */
    private receiveOutsideDialogRequest;
    /**
     * Responses are first processed by the transport layer and then passed
     * up to the transaction layer.  The transaction layer performs its
     * processing and then passes the response up to the TU.  The majority
     * of response processing in the TU is method specific.  However, there
     * are some general behaviors independent of the method.
     * https://tools.ietf.org/html/rfc3261#section-8.1.3
     * @param message - Incoming response message from transport layer.
     */
    private receiveResponseFromTransport;
}

/**
 * User Agent Core configuration.
 * @public
 */
declare interface UserAgentCoreConfiguration {
    /**
     * Address-of-Record (AOR).
     * @remarks
     * https://tools.ietf.org/html/rfc3261#section-6
     */
    aor: URI;
    /**
     * Contact.
     * @remarks
     * https://tools.ietf.org/html/rfc3261#section-8.1.1.8
     */
    contact: Contact;
    /**
     * From header display name.
     */
    displayName: string;
    /**
     * Logger factory.
     */
    loggerFactory: LoggerFactory;
    /**
     * Force Via header field transport to TCP.
     */
    hackViaTcp: boolean;
    /**
     * Preloaded route set.
     */
    routeSet: Array<string>;
    /**
     * Unique instance id.
     */
    sipjsId: string;
    /**
     * Option tags of supported SIP extensions.
     */
    supportedOptionTags: Array<string>;
    /**
     * Option tags of supported SIP extensions.
     * Used in responses.
     * @remarks
     * FIXME: Make this go away.
     */
    supportedOptionTagsResponse: Array<string>;
    /**
     * User-Agent header field value.
     * @remarks
     * https://tools.ietf.org/html/rfc3261#section-20.41
     */
    userAgentHeaderFieldValue: string | undefined;
    /**
     * Force use of "rport" Via header field parameter.
     * @remarks
     * https://www.ietf.org/rfc/rfc3581.txt
     */
    viaForceRport: boolean;
    /**
     * Via header field host name or network address.
     * @remarks
     * The Via header field indicates the path taken by the request so far
     * and indicates the path that should be followed in routing responses.
     */
    viaHost: string;
    /**
     * DEPRECATED
     * Authentication factory function.
     */
    authenticationFactory(): DigestAuthentication | undefined;
    /**
     * DEPRECATED: This is a hack to get around `Transport`
     * requiring the `UA` to start for construction.
     */
    transportAccessor(): Transport_2 | undefined;
}

/**
 * User Agent Core delegate.
 * @public
 */
declare interface UserAgentCoreDelegate {
    /**
     * Receive INVITE request.
     * @param request - Incoming INVITE request.
     */
    onInvite?(request: IncomingInviteRequest): void;
    /**
     * Receive MESSAGE request.
     * @param request - Incoming MESSAGE request.
     */
    onMessage?(request: IncomingMessageRequest): void;
    /**
     * DEPRECATED. Receive NOTIFY request.
     * @param message - Incoming NOTIFY request.
     */
    onNotify?(request: IncomingNotifyRequest): void;
    /**
     * Receive REFER request.
     * @param request - Incoming REFER request.
     */
    onRefer?(request: IncomingReferRequest): void;
    /**
     * Receive REGISTER request.
     * @param request - Incoming REGISTER request.
     */
    onRegister?(request: IncomingRegisterRequest): void;
    /**
     * Receive SUBSCRIBE request.
     * @param request - Incoming SUBSCRIBE request.
     */
    onSubscribe?(request: IncomingSubscribeRequest): void;
}

/**
 * Delegate for {@link UserAgent}.
 * @public
 */
export declare interface UserAgentDelegate {
    /**
     * Called upon transport transitioning to connected state.
     */
    onConnect?(): void;
    /**
     * Called upon transport transitioning from connected state.
     * @param error - An error if disconnect triggered by transport. Otherwise undefined.
     */
    onDisconnect?(error?: Error): void;
    /**
     * Called upon receipt of an invitation.
     * @remarks
     * Handler for incoming out of dialog INVITE requests.
     * @param invitation - The invitation.
     */
    onInvite?(invitation: Invitation): void;
    /**
     * Called upon receipt of a message.
     * @remarks
     * Handler for incoming out of dialog MESSAGE requests.
     * @param message - The message.
     */
    onMessage?(message: Message): void;
    /**
     * Called upon receipt of a notification.
     * @remarks
     * Handler for incoming out of dialog NOTIFY requests.
     * @param notification - The notification.
     */
    onNotify?(notification: Notification): void;
    /**
     * @alpha
     * Called upon receipt of a referral.
     * @remarks
     * Handler for incoming out of dialog REFER requests.
     * @param referral - The referral.
     */
    onRefer?(referral: Referral): void;
    /**
     * @alpha
     * Called upon receipt of a registration.
     * @remarks
     * Handler for incoming out of dialog REGISTER requests.
     * @param registration - The registration.
     */
    onRegister?(registration: unknown): void;
    /**
     * @alpha
     * Called upon receipt of a subscription.
     * @remarks
     * Handler for incoming out of dialog SUBSCRIBE requests.
     * @param subscription - The subscription.
     */
    onSubscribe?(subscription: Subscription): void;
    /**
     * @internal
     * Called upon receipt of an out of dialog REFER. Used by test suite.
     * @param request - The request.
     */
    onReferRequest?(request: IncomingReferRequest): void;
    /**
     * @internal
     * Called upon receipt of a REGISTER request. Used by test suite.
     * @param request - The request.
     */
    onRegisterRequest?(request: IncomingRegisterRequest): void;
    /**
     * @internal
     * Called upon receipt of an out of dialog SUBSCRIBE request. Used by test suite.
     * @param request - The request.
     */
    onSubscribeRequest?(request: IncomingSubscribeRequest): void;
}

/**
 * Options for {@link UserAgent} constructor.
 * @public
 */
export declare interface UserAgentOptions {
    /**
     * If `true`, the user agent will accept out of dialog NOTIFY.
     * @remarks
     * RFC 6665 obsoletes the use of out of dialog NOTIFY from RFC 3265.
     * @defaultValue `false`
     */
    allowLegacyNotifications?: boolean;
    /**
     * Authorization ha1.
     * @defaultValue `""`
     */
    authorizationHa1?: string;
    /**
     * Authorization password.
     * @defaultValue `""`
     */
    authorizationPassword?: string;
    /**
     * Authorization username.
     * @defaultValue `""`
     */
    authorizationUsername?: string;
    /**
     * The user portion of user agent's contact URI.
     * @remarks
     * If not specifed a random string will be generated and utilized as the user portion of the contact URI.
     * @defaultValue `""`
     */
    contactName?: string;
    /**
     * The URI parameters of the user agent's contact URI.
     * @defaultValue `{ transport: "ws" }`
     */
    contactParams?: {
        [name: string]: string;
    };
    /**
     * Delegate for {@link UserAgent}.
     * @defaultValue `{}`
     */
    delegate?: UserAgentDelegate;
    /**
     * The display name associated with the user agent.
     * @remarks
     * Descriptive name to be shown to the called party when calling or sending IM messages
     * (the display name portion of the From header).
     * It must NOT be enclosed between double quotes even if the given name contains multi-byte symbols
     * (SIPjs will always enclose the `displayName` value between double quotes).
     * @defaultValue `""`
     */
    displayName?: string;
    /**
     * Force adding rport to Via header.
     * @defaultValue `false`
     */
    forceRport?: boolean;
    /**
     * If `true`, the `stop()` method will attempt to gracefully end all dialogs and registrations before disconnecting.
     * Otherwise `stop()` will transition immediately abandoning all dialogs and registrations.
     * @defaultValue `true`
     */
    gracefulShutdown?: boolean;
    /**
     * Hack
     * @deprecated TBD
     */
    hackIpInContact?: boolean | string;
    /**
     * Hack
     * @deprecated TBD
     */
    hackAllowUnregisteredOptionTags?: boolean;
    /**
     * Hack
     * @deprecated TBD
     */
    hackViaTcp?: boolean;
    /**
     * UUID to provide with "+sip.instance" Contact header parameter.
     * @defaultValue A randomly generated uuid
     */
    instanceId?: string;
    /**
     * Add "+sip.instance" Contact header parameter to all requests.
     * @defaultValue `false`
     */
    instanceIdAlwaysAdded?: boolean;
    /**
     * Indicates whether log messages should be written to the browser console.
     * @defaultValue `true`
     */
    logBuiltinEnabled?: boolean;
    /**
     * If true, constructor logs the user agent configuration.
     * @defaultValue `true`
     */
    logConfiguration?: boolean;
    /**
     * A function which will be called every time a log is generated.
     * @defaultValue A noop
     */
    logConnector?: LogConnector;
    /**
     * Indicates the verbosity level of the log messages.
     * @defaultValue `"log"`
     */
    logLevel?: LogLevel;
    /**
     * Number of seconds after which an incoming call is rejected if not answered.
     * @defaultValue 60
     */
    noAnswerTimeout?: number;
    /**
     * Adds a Route header(s) to outgoing requests.
     * @defaultValue `[]`
     */
    preloadedRouteSet?: Array<string>;
    /**
     * @deprecated
     * Maximum number of times to attempt to reconnect when the transport connection drops.
     * @defaultValue 0
     */
    reconnectionAttempts?: number;
    /**
     * @deprecated
     * Seconds to wait between reconnection attempts when the transport connection drops.
     * @defaultValue 4
     */
    reconnectionDelay?: number;
    /**
     * If true, a first provisional response after the 100 Trying will be sent automatically if UAC does not
     * require reliable provisional responses.
     * @defaultValue `true`
     */
    sendInitialProvisionalResponse?: boolean;
    /**
     * A factory for generating `SessionDescriptionHandler` instances.
     * @remarks
     * The factory will be passed a `Session` object for the current session
     * and the `sessionDescriptionHandlerFactoryOptions` object.
     * @defaultValue `Web.SessionDescriptionHandler.defaultFactory`
     */
    sessionDescriptionHandlerFactory?: SessionDescriptionHandlerFactory;
    /**
     * Options to passed to `sessionDescriptionHandlerFactory`.
     * @remarks
     * See `Web.SessionDescriptionHandlerOptions` for details.
     * @defaultValue `{}`
     */
    sessionDescriptionHandlerFactoryOptions?: object;
    /**
     * Reliable provisional responses.
     * https://tools.ietf.org/html/rfc3262
     * @defaultValue `SIPExtension.Unsupported`
     */
    sipExtension100rel?: SIPExtension;
    /**
     * Replaces header.
     * https://tools.ietf.org/html/rfc3891
     * @defaultValue `SIPExtension.Unsupported`
     */
    sipExtensionReplaces?: SIPExtension;
    /**
     * Extra option tags to claim support for.
     * @remarks
     * Setting an extra option tag does not enable support for the associated extension
     * it simply adds the tag to the list of supported options.
     * See {@link UserAgentRegisteredOptionTags} for valid option tags.
     * @defaultValue `[]`
     */
    sipExtensionExtraSupported?: Array<string>;
    /**
     * An id uniquely identify this user agent instance.
     * @defaultValue
     * A random id generated by default.
     */
    sipjsId?: string;
    /**
     * A constructor function for the user agent's `Transport`.
     * @remarks
     * For more information about creating your own transport see `Transport`.
     * @defaultValue `WebSocketTransport`
     */
    transportConstructor?: new (logger: Logger, options: any) => Transport;
    /**
     * An options bucket object passed to `transportConstructor` when instantiated.
     * @remarks
     * See WebSocket Transport Configuration Parameters for the full list of options for the default transport.
     * @defaultValue `{}`
     */
    transportOptions?: unknown;
    /**
     * SIP Addresses-of-Record URI associated with the user agent.
     * @remarks
     * This is a SIP address given to you by your provider.
     * If the user agent registers, it is the address-of-record which the user agent registers a contact for.
     * An address-of-record represents an identity of the user, generally a long-term identity,
     * and it does not have a dependency on any device; users can move between devices or even
     * be associated with multiple devices at one time while retaining the same address-of-record.
     * A simple URI, generally of the form `sip:egdar@example.com`, is used for an address-of-record.
     * @defaultValue
     * By default, URI is set to `sip:anonymous.X@anonymous.invalid`, where X is a random token generated for each UA.
     */
    uri?: URI;
    /**
     * User agent string used in the UserAgent header.
     * @defaultValue
     * A reasonable value is utilized.
     */
    userAgentString?: string;
    /**
     * Hostname to use in Via header.
     * @defaultValue
     * A random hostname in the .invalid domain.
     */
    viaHost?: string;
}

/**
 * SIP Option Tags
 * @remarks
 * http://www.iana.org/assignments/sip-parameters/sip-parameters.xhtml#sip-parameters-4
 * @public
 */
export declare const UserAgentRegisteredOptionTags: {
    [option: string]: boolean;
};

/**
 * User Agent Server (UAS).
 * @remarks
 * A user agent server is a logical entity
 * that generates a response to a SIP request.  The response
 * accepts, rejects, or redirects the request.  This role lasts
 * only for the duration of that transaction.  In other words, if
 * a piece of software responds to a request, it acts as a UAS for
 * the duration of that transaction.  If it generates a request
 * later, it assumes the role of a user agent client for the
 * processing of that transaction.
 * https://tools.ietf.org/html/rfc3261#section-6
 * @public
 */
declare class UserAgentServer implements IncomingRequest {
    private transactionConstructor;
    protected core: UserAgentCore;
    message: IncomingRequestMessage;
    delegate?: IncomingRequestDelegate | undefined;
    protected logger: Logger;
    protected toTag: string;
    private _transaction;
    constructor(transactionConstructor: ServerTransactionConstructor, core: UserAgentCore, message: IncomingRequestMessage, delegate?: IncomingRequestDelegate | undefined);
    dispose(): void;
    get loggerFactory(): LoggerFactory;
    /** The transaction associated with this request. */
    get transaction(): ServerTransaction;
    accept(options?: ResponseOptions): OutgoingResponse;
    progress(options?: ResponseOptions): OutgoingResponse;
    redirect(contacts: Array<URI>, options?: ResponseOptions): OutgoingResponse;
    reject(options?: ResponseOptions): OutgoingResponse;
    trying(options?: ResponseOptions): OutgoingResponse;
    /**
     * If the UAS did not find a matching transaction for the CANCEL
     * according to the procedure above, it SHOULD respond to the CANCEL
     * with a 481 (Call Leg/Transaction Does Not Exist).  If the transaction
     * for the original request still exists, the behavior of the UAS on
     * receiving a CANCEL request depends on whether it has already sent a
     * final response for the original request.  If it has, the CANCEL
     * request has no effect on the processing of the original request, no
     * effect on any session state, and no effect on the responses generated
     * for the original request.  If the UAS has not issued a final response
     * for the original request, its behavior depends on the method of the
     * original request.  If the original request was an INVITE, the UAS
     * SHOULD immediately respond to the INVITE with a 487 (Request
     * Terminated).  A CANCEL request has no impact on the processing of
     * transactions with any other method defined in this specification.
     * https://tools.ietf.org/html/rfc3261#section-9.2
     * @param request - Incoming CANCEL request.
     */
    receiveCancel(message: IncomingRequestMessage): void;
    protected get acceptable(): boolean;
    protected get progressable(): boolean;
    protected get redirectable(): boolean;
    protected get rejectable(): boolean;
    protected get tryingable(): boolean;
    /**
     * When a UAS wishes to construct a response to a request, it follows
     * the general procedures detailed in the following subsections.
     * Additional behaviors specific to the response code in question, which
     * are not detailed in this section, may also be required.
     *
     * Once all procedures associated with the creation of a response have
     * been completed, the UAS hands the response back to the server
     * transaction from which it received the request.
     * https://tools.ietf.org/html/rfc3261#section-8.2.6
     * @param statusCode - Status code to reply with.
     * @param options - Reply options bucket.
     */
    private reply;
    private init;
}

/**
 * {@link UserAgent} state.
 * @remarks
 * Valid state transitions:
 * ```
 * 1. "Started" --> "Stopped"
 * 2. "Stopped" --> "Started"
 * ```
 * @public
 */
export declare enum UserAgentState {
    Started = "Started",
    Stopped = "Stopped"
}

export { }
