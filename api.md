<a name="Dashboards"></a>

## Dashboards
Zoom Dashboards API.

**Kind**: global class  
**See**: https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#tag/Dashboards  

* [Dashboards](#Dashboards)
    * [new Dashboards(client)](#new_Dashboards_new)
    * [.listMeetings([params])](#Dashboards+listMeetings) ⇒ <code>Promise</code>
    * [.listMeetingParticipants(meetingId, [params])](#Dashboards+listMeetingParticipants) ⇒ <code>Promise</code>
    * [.getMeetingDetails(meetingId, [params])](#Dashboards+getMeetingDetails) ⇒ <code>Promise</code>

<a name="new_Dashboards_new"></a>

### new Dashboards(client)
Make Dashboards instance.


| Param | Type |
| --- | --- |
| client | <code>Zoom</code> | 

<a name="Dashboards+listMeetings"></a>

### dashboards.listMeetings([params]) ⇒ <code>Promise</code>
List total live or past meetings that occurred during a specified
period of time.

**Kind**: instance method of [<code>Dashboards</code>](#Dashboards)  
**See**: https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/meetings  

| Param | Type |
| --- | --- |
| [params] | <code>Object</code> | 
| [params.type] | <code>&quot;past&quot;</code> \| <code>&quot;pastOne&quot;</code> \| <code>&quot;live&quot;</code> | 
| [params.from] | <code>string</code> | 
| [params.to] | <code>string</code> | 
| [params.page_size] | <code>number</code> | 
| [params.next_page_token] | <code>string</code> | 
| [params.group_id] | <code>string</code> | 
| [params.include_fields] | <code>&quot;tracking\_fields&quot;</code> | 

<a name="Dashboards+listMeetingParticipants"></a>

### dashboards.listMeetingParticipants(meetingId, [params]) ⇒ <code>Promise</code>
List participants from live or past meetings.

**Kind**: instance method of [<code>Dashboards</code>](#Dashboards)  
**See**: https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/dashboardMeetingParticipants  

| Param | Type |
| --- | --- |
| meetingId | <code>string</code> | 
| [params] | <code>Object</code> | 
| [params.type] | <code>&quot;past&quot;</code> \| <code>&quot;pastOne&quot;</code> \| <code>&quot;live&quot;</code> | 
| [params.page_size] | <code>number</code> | 
| [params.next_page_token] | <code>string</code> | 
| [params.include_fields] | <code>&quot;registrant\_id&quot;</code> | 

<a name="Dashboards+getMeetingDetails"></a>

### dashboards.getMeetingDetails(meetingId, [params]) ⇒ <code>Promise</code>
Get details on live or past meetings.

**Kind**: instance method of [<code>Dashboards</code>](#Dashboards)  
**See**: https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/dashboardMeetingDetail  

| Param | Type |
| --- | --- |
| meetingId | <code>string</code> | 
| [params] | <code>Object</code> | 
| [params.type] | <code>&quot;past&quot;</code> \| <code>&quot;pastOne&quot;</code> \| <code>&quot;live&quot;</code> | 

