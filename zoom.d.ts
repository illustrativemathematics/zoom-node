export default Zoom;
/**
 * Zoom API client.
 */
declare class Zoom {
    /**
     * Make new client. This is the main entry point of the package.
     *
     * @param {Object} config
     * @param {string} config.accountId
     * @param {string} config.clientId
     * @param {string} config.clientSecret
     * @param {string} [config.baseURL]
     * @param {string} [config.baseAuthURL]
     * @param {number} [config.timeout]
     */
    constructor({ accountId, clientId, clientSecret, baseURL, baseAuthURL, timeout, }: {
        accountId: string;
        clientId: string;
        clientSecret: string;
        baseURL?: string;
        baseAuthURL?: string;
        timeout?: number;
    });
    auth: import("axios").AxiosInstance;
    api: import("axios").AxiosInstance;
    /**
     * Dashboards API.
     *
     * @type {Dashboards}
     */
    dashboards: Dashboards;
    /**
     * Groups API.
     *
     * @type {Groups}
     */
    groups: Groups;
    /**
     * Meetings API.
     *
     * @type {Meetings}
     */
    meetings: Meetings;
    /**
     * Reports API.
     *
     * @type {Reports}
     */
    reports: Reports;
    setTokenFunc(): void;
    token: () => Promise<any>;
    makeAPIRequest(conf: any): Promise<any>;
    withTokenRefreshAttempt: (conf: any) => Promise<any>;
    withPagination(reqFunc: any, conf: any, itemsName: any, tokenName?: string): any;
}
/**
 * Zoom Dashboards API.
 *
 * @see https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#tag/Dashboards
 */
declare class Dashboards {
    /**
     * Make Dashboards instance.
     *
     * @param {Zoom} client
     */
    constructor(client: Zoom);
    client: Zoom;
    /**
     * List total live or past meetings that occurred during a specified
     * period of time.
     *
     * @see https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/meetings
     *
     * @param {Object} [params]
     *
     * @returns {Promise}
     */
    listMeetings(params?: any): Promise<any>;
    /**
     * List participants from live or past meetings.
     *
     * @see https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/dashboardMeetingParticipants
     *
     * @param {string} meetingId
     * @param {Object} [params]
     *
     * @returns {Promise}
     */
    listMeetingParticipants(meetingId: string, params?: any): Promise<any>;
    /**
     * Get details on live or past meetings.
     *
     * @see https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/dashboardMeetingDetail
     *
     * @param {string} meetingId
     * @param {Object} [params]
     *
     * @returns {Promise}
     */
    getMeetingDetails(meetingId: string, params?: any): Promise<any>;
}
/**
 * Zoom Groups API.
 *
 * @see https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#tag/Groups
 */
declare class Groups {
    /**
     * Make Groups instance.
     *
     * @param {Zoom} client
     */
    constructor(client: Zoom);
    client: Zoom;
    /**
     * List groups under an account.
     *
     * @see https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/groups
     *
     * @returns {Promise}
     */
    listGroups(): Promise<any>;
    /**
     * Get a group under an account.
     *
     * @see https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/group
     *
     * @param {string} groupId
     *
     * @returns {Promise}
     */
    getAGroup(groupId: string): Promise<any>;
    /**
     * List the members of a group under your account.
     *
     * @see https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/groupMembers
     *
     * @param {string} groupId
     * @param {Object} [params]
     *
     * @returns {Promise}
     */
    listGroupMembers(groupId: string, params?: any): Promise<any>;
}
/**
 * Zoom Meetings API.
 *
 * @see https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#tag/Meetings
 */
declare class Meetings {
    /**
     * Make Meetings instance.
     *
     * @param {Zoom} client
     */
    constructor(client: Zoom);
    client: Zoom;
    /**
     * List a user's (meeting host) scheduled meetings.
     *
     * @see https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/meetings
     *
     * @param {number|string|"me"} userId
     * @param {Object} [params]
     *
     * @returns {Promise}
     */
    listMeetings(userId: number | string | "me", params?: any): Promise<any>;
    /**
     * Retrieve the details of a meeting.
     *
     * @see https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/meeting
     *
     * @param {number} meetingId
     * @param {Object} [params]
     *
     * @returns {Promise}
     */
    getAMeeting(meetingId: number, params?: any): Promise<any>;
    /**
     * Retrieve information on participants from a past meeting.
     *
     * @see https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/pastMeetingParticipants
     *
     * @param {string} meetingId
     * @param {Object} [params]
     *
     * @returns {Promise}
     */
    getPastMeetingParticipants(meetingId: string, params?: any): Promise<any>;
    /**
     * Retrieve the meeting invite note that was sent for a specific meeting.
     *
     * @see https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/meetingInvitation
     *
     * @param {number} meetingId
     *
     * @returns {Promise}
     */
    getMeetingInvitation(meetingId: number): Promise<any>;
    /**
     * Create a meeting for a user.
     *
     * @see https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/meetingCreate
     *
     * @param {number|string|"me"} userId
     * @param {Object} meeting
     *
     * @returns {Promise}
     */
    createAMeeting(userId: number | string | "me", meeting: any): Promise<any>;
    /**
     * Delete a meeting.
     *
     * @see https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/meetingDelete
     *
     * @param {number} meetingId
     * @param {Object} [params]
     *
     * @returns {Promise}
     */
    deleteAMeeting(meetingId: number, params?: any): Promise<any>;
}
/**
 * Zoom Reports API.
 *
 * @see https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#tag/Reports
 */
declare class Reports {
    /**
     * Make Reports instance.
     *
     * @param {Zoom} client
     */
    constructor(client: Zoom);
    client: Zoom;
    /**
     * Return a report of a past meeting with two or more participants,
     * including the host.
     *
     * @see https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/reportMeetingParticipants
     *
     * @param {string} meetingId
     * @param {Object} [params]
     *
     * @returns {Promise}
     */
    getMeetingParticipantReports(meetingId: string, params?: any): Promise<any>;
}
