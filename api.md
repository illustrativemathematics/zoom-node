## Classes

<dl>
<dt><a href="#Dashboards">Dashboards</a></dt>
<dd><p>Zoom Dashboards API.</p>
</dd>
<dt><a href="#Groups">Groups</a></dt>
<dd><p>Zoom Groups API.</p>
</dd>
<dt><a href="#Meetings">Meetings</a></dt>
<dd><p>Zoom Meetings API.</p>
</dd>
<dt><a href="#Reports">Reports</a></dt>
<dd><p>Zoom Reports API.</p>
</dd>
<dt><a href="#Zoom">Zoom</a></dt>
<dd><p>Zoom API client.</p>
</dd>
</dl>

<a name="Dashboards"></a>

## Dashboards

Zoom Dashboards API.

**Kind**: global class  
**See**: https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#tag/Dashboards

- [Dashboards](#Dashboards)
  - [new Dashboards(client)](#new_Dashboards_new)
  - [.listMeetings([config])](#Dashboards+listMeetings) ⇒ <code>Promise</code>
  - [.listMeetingParticipants(meetingId, [config])](#Dashboards+listMeetingParticipants) ⇒ <code>Promise</code>
  - [.getMeetingDetails(meetingId, [config])](#Dashboards+getMeetingDetails) ⇒ <code>Promise</code>

<a name="new_Dashboards_new"></a>

### new Dashboards(client)

Make Dashboards instance.

| Param  | Type                       |
| ------ | -------------------------- |
| client | [<code>Zoom</code>](#Zoom) |

<a name="Dashboards+listMeetings"></a>

### dashboards.listMeetings([config]) ⇒ <code>Promise</code>

List total live or past meetings that occurred during a specified
period of time.

**Kind**: instance method of [<code>Dashboards</code>](#Dashboards)  
**See**: https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/meetings

| Param                           | Type                                                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| [config]                        | <code>Object</code>                                                                                |
| [config.params]                 | <code>Object</code>                                                                                |
| [config.params.type]            | <code>&quot;past&quot;</code> \| <code>&quot;pastOne&quot;</code> \| <code>&quot;live&quot;</code> |
| [config.params.from]            | <code>string</code>                                                                                |
| [config.params.to]              | <code>string</code>                                                                                |
| [config.params.page_size]       | <code>number</code>                                                                                |
| [config.params.next_page_token] | <code>string</code>                                                                                |
| [config.params.group_id]        | <code>string</code>                                                                                |
| [config.params.include_fields]  | <code>&quot;tracking_fields&quot;</code>                                                           |

<a name="Dashboards+listMeetingParticipants"></a>

### dashboards.listMeetingParticipants(meetingId, [config]) ⇒ <code>Promise</code>

List participants from live or past meetings.

**Kind**: instance method of [<code>Dashboards</code>](#Dashboards)  
**See**: https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/dashboardMeetingParticipants

| Param                           | Type                                                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| meetingId                       | <code>string</code>                                                                                |
| [config]                        | <code>Object</code>                                                                                |
| [config.params]                 | <code>Object</code>                                                                                |
| [config.params.type]            | <code>&quot;past&quot;</code> \| <code>&quot;pastOne&quot;</code> \| <code>&quot;live&quot;</code> |
| [config.params.page_size]       | <code>number</code>                                                                                |
| [config.params.next_page_token] | <code>string</code>                                                                                |
| [config.params.include_fields]  | <code>&quot;registrant_id&quot;</code>                                                             |

<a name="Dashboards+getMeetingDetails"></a>

### dashboards.getMeetingDetails(meetingId, [config]) ⇒ <code>Promise</code>

Get details on live or past meetings.

**Kind**: instance method of [<code>Dashboards</code>](#Dashboards)  
**See**: https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/dashboardMeetingDetail

| Param                | Type                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| meetingId            | <code>string</code>                                                                                |
| [config]             | <code>Object</code>                                                                                |
| [config.params]      | <code>Object</code>                                                                                |
| [config.params.type] | <code>&quot;past&quot;</code> \| <code>&quot;pastOne&quot;</code> \| <code>&quot;live&quot;</code> |

<a name="Groups"></a>

## Groups

Zoom Groups API.

**Kind**: global class  
**See**: https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#tag/Groups

- [Groups](#Groups)
  - [new Groups(client)](#new_Groups_new)
  - [.listGroups()](#Groups+listGroups) ⇒ <code>Promise</code>
  - [.getAGroup(groupId)](#Groups+getAGroup) ⇒ <code>Promise</code>
  - [.listGroupMembers(groupId, [config])](#Groups+listGroupMembers) ⇒ <code>Promise</code>

<a name="new_Groups_new"></a>

### new Groups(client)

Make Groups instance.

| Param  | Type                       |
| ------ | -------------------------- |
| client | [<code>Zoom</code>](#Zoom) |

<a name="Groups+listGroups"></a>

### groups.listGroups() ⇒ <code>Promise</code>

List groups under an account.

**Kind**: instance method of [<code>Groups</code>](#Groups)  
**See**: https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/groups  
<a name="Groups+getAGroup"></a>

### groups.getAGroup(groupId) ⇒ <code>Promise</code>

Get a group under an account.

**Kind**: instance method of [<code>Groups</code>](#Groups)  
**See**: https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/group

| Param   | Type                |
| ------- | ------------------- |
| groupId | <code>string</code> |

<a name="Groups+listGroupMembers"></a>

### groups.listGroupMembers(groupId, [config]) ⇒ <code>Promise</code>

List the members of a group under your account.

**Kind**: instance method of [<code>Groups</code>](#Groups)  
**See**: https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/groupMembers

| Param                           | Type                |
| ------------------------------- | ------------------- |
| groupId                         | <code>string</code> |
| [config]                        | <code>Object</code> |
| [config.params]                 | <code>Object</code> |
| [config.params.page_size]       | <code>number</code> |
| [config.params.next_page_token] | <code>string</code> |

<a name="Meetings"></a>

## Meetings

Zoom Meetings API.

**Kind**: global class  
**See**: https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#tag/Meetings

- [Meetings](#Meetings)
  - [new Meetings(client)](#new_Meetings_new)
  - [.listMeetings(userId, [config])](#Meetings+listMeetings) ⇒ <code>Promise</code>
  - [.getAMeeting(meetingId, [config])](#Meetings+getAMeeting) ⇒ <code>Promise</code>
  - [.getPastMeetingParticipants(meetingId, [config])](#Meetings+getPastMeetingParticipants) ⇒ <code>Promise</code>

<a name="new_Meetings_new"></a>

### new Meetings(client)

Make Meetings instance.

| Param  | Type                       |
| ------ | -------------------------- |
| client | [<code>Zoom</code>](#Zoom) |

<a name="Meetings+listMeetings"></a>

### meetings.listMeetings(userId, [config]) ⇒ <code>Promise</code>

List a user's (meeting host) scheduled meetings.

**Kind**: instance method of [<code>Meetings</code>](#Meetings)  
**See**: https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/meetings

| Param                           | Type                                                                                                                                                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| userId                          | <code>number</code> \| <code>string</code> \| <code>&quot;me&quot;</code>                                                                                                                            |
| [config]                        | <code>Object</code>                                                                                                                                                                                  |
| [config.params]                 | <code>Object</code>                                                                                                                                                                                  |
| [config.params.type]            | <code>&quot;scheduled&quot;</code> \| <code>&quot;live&quot;</code> \| <code>&quot;upcoming&quot;</code> \| <code>&quot;upcoming_meetings&quot;</code> \| <code>&quot;previous_meetings&quot;</code> |
| [config.params.page_size]       | <code>number</code>                                                                                                                                                                                  |
| [config.params.next_page_token] | <code>string</code>                                                                                                                                                                                  |

<a name="Meetings+getAMeeting"></a>

### meetings.getAMeeting(meetingId, [config]) ⇒ <code>Promise</code>

Retrieve the details of a meeting.

**Kind**: instance method of [<code>Meetings</code>](#Meetings)  
**See**: https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/meeting

| Param                                     | Type                 |
| ----------------------------------------- | -------------------- |
| meetingId                                 | <code>number</code>  |
| [config]                                  | <code>Object</code>  |
| [config.params]                           | <code>Object</code>  |
| [config.params.occurrence_id]             | <code>string</code>  |
| [config.params.show_previous_occurrences] | <code>boolean</code> |

<a name="Meetings+getPastMeetingParticipants"></a>

### meetings.getPastMeetingParticipants(meetingId, [config]) ⇒ <code>Promise</code>

Retrieve information on participants from a past meeting.

**Kind**: instance method of [<code>Meetings</code>](#Meetings)  
**See**: https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/pastMeetingParticipants

| Param                           | Type                |
| ------------------------------- | ------------------- |
| meetingId                       | <code>string</code> |
| [config]                        | <code>Object</code> |
| [config.params]                 | <code>Object</code> |
| [config.params.page_size]       | <code>number</code> |
| [config.params.next_page_token] | <code>string</code> |

<a name="Reports"></a>

## Reports

Zoom Reports API.

**Kind**: global class  
**See**: https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#tag/Reports

- [Reports](#Reports)
  - [new Reports(client)](#new_Reports_new)
  - [.getMeetingParticipantReports(meetingId, [config])](#Reports+getMeetingParticipantReports) ⇒ <code>Promise</code>

<a name="new_Reports_new"></a>

### new Reports(client)

Make Reports instance.

| Param  | Type                       |
| ------ | -------------------------- |
| client | [<code>Zoom</code>](#Zoom) |

<a name="Reports+getMeetingParticipantReports"></a>

### reports.getMeetingParticipantReports(meetingId, [config]) ⇒ <code>Promise</code>

Return a report of a past meeting with two or more participants,
including the host.

**Kind**: instance method of [<code>Reports</code>](#Reports)  
**See**: https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/reportMeetingParticipants

| Param                           | Type                                   |
| ------------------------------- | -------------------------------------- |
| meetingId                       | <code>string</code>                    |
| [config]                        | <code>Object</code>                    |
| [config.params]                 | <code>Object</code>                    |
| [config.params.page_size]       | <code>number</code>                    |
| [config.params.next_page_token] | <code>string</code>                    |
| [config.params.include_fields]  | <code>&quot;registrant_id&quot;</code> |

<a name="Zoom"></a>

## Zoom

Zoom API client.

**Kind**: global class

- [Zoom](#Zoom)
  - [new Zoom(config)](#new_Zoom_new)
  - [.dashboards](#Zoom+dashboards) : [<code>Dashboards</code>](#Dashboards)
  - [.groups](#Zoom+groups) : [<code>Groups</code>](#Groups)
  - [.meetings](#Zoom+meetings) : [<code>Meetings</code>](#Meetings)
  - [.reports](#Zoom+reports) : [<code>Reports</code>](#Reports)

<a name="new_Zoom_new"></a>

### new Zoom(config)

Make new client. This is the main entry point of the package.

| Param                | Type                |
| -------------------- | ------------------- |
| config               | <code>Object</code> |
| config.accountId     | <code>string</code> |
| config.clientId      | <code>string</code> |
| config.clientSecret  | <code>string</code> |
| [config.baseURL]     | <code>string</code> |
| [config.baseAuthURL] | <code>string</code> |
| [config.timeout]     | <code>number</code> |

<a name="Zoom+dashboards"></a>

### zoom.dashboards : [<code>Dashboards</code>](#Dashboards)

Dashboards API.

**Kind**: instance property of [<code>Zoom</code>](#Zoom)  
<a name="Zoom+groups"></a>

### zoom.groups : [<code>Groups</code>](#Groups)

Groups API.

**Kind**: instance property of [<code>Zoom</code>](#Zoom)  
<a name="Zoom+meetings"></a>

### zoom.meetings : [<code>Meetings</code>](#Meetings)

Meetings API.

**Kind**: instance property of [<code>Zoom</code>](#Zoom)  
<a name="Zoom+reports"></a>

### zoom.reports : [<code>Reports</code>](#Reports)

Reports API.

**Kind**: instance property of [<code>Zoom</code>](#Zoom)
