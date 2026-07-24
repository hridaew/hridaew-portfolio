/**
 * Explicit board layouts for classified Domis flows.
 * Node ids must match flow-classified.json.
 */

export type NodeLayout = {
  id: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
};

export type FlowLayout = {
  width: number;
  height: number;
  ownerY: number;
  ownerH: number;
  backY: number;
  backH: number;
  nodes: NodeLayout[];
  /** Optional custom orthogonal paths keyed `from>to>label` */
  edgePaths?: Record<string, string>;
};

export const addressLayout: FlowLayout = {
  width: 1920,
  height: 660,
  ownerY: 8,
  ownerH: 340,
  backY: 348,
  backH: 304,
  nodes: [
    // Owner — intake
    { id: "start", x: 24, y: 100, w: 96, h: 56 },
    { id: "enter_address", x: 150, y: 98, w: 145, h: 60 },
    { id: "autofill_ok", x: 340, y: 83 },
    { id: "choose_autofill", x: 480, y: 100, w: 145, h: 56 },
    { id: "type_manual", x: 480, y: 230, w: 145, h: 60 },
    // Owner — after AI returns
    { id: "wait_facts", x: 700, y: 100, w: 145, h: 56 },
    { id: "useful_data", x: 900, y: 83 },
    { id: "review_prefill", x: 1045, y: 100, w: 145, h: 56 },
    { id: "leave_blanks", x: 1045, y: 200, w: 145, h: 56 },
    { id: "empty_form_manual", x: 1045, y: 280, w: 145, h: 60 },
    { id: "edit_fields", x: 1285, y: 100, w: 150, h: 60 },
    { id: "edit_photo", x: 1485, y: 100, w: 150, h: 60 },
    { id: "home_created", x: 1685, y: 100, w: 135, h: 56 },
    // Backend / AI
    { id: "resolve_address", x: 400, y: 450, w: 200, h: 64 },
    { id: "run_searches", x: 650, y: 450, w: 155, h: 64 },
    { id: "source_results", x: 850, y: 440, w: 155, h: 80 },
    { id: "cross_reference", x: 1050, y: 450, w: 165, h: 64 },
    { id: "consensus_payload", x: 1260, y: 440, w: 165, h: 80 },
    { id: "return_payload", x: 1470, y: 450, w: 145, h: 64 },
  ],
  edgePaths: {
    "choose_autofill>resolve_address>": "M 552 156 V 420 H 500 V 450",
    "type_manual>resolve_address>": "M 552 260 V 420 H 500",
    "return_payload>wait_facts>": "M 1542 450 V 370 H 772 V 156",
    "useful_data>review_prefill>Yes": "M 990 128 H 1045",
    "useful_data>leave_blanks>Incomplete": "M 945 173 V 228 H 1045",
    "useful_data>empty_form_manual>Fail": "M 945 173 V 310 H 1045",
    "review_prefill>edit_fields>": "M 1190 128 H 1285",
    "leave_blanks>edit_fields>": "M 1190 228 H 1235 V 128 H 1285",
    "empty_form_manual>edit_fields>": "M 1190 310 H 1235 V 128",
    "edit_photo>home_created>Skip": "M 1560 160 V 185 H 1752 V 156",
  },
};

export const applianceLayout: FlowLayout = {
  width: 1880,
  height: 640,
  ownerY: 8,
  ownerH: 320,
  backY: 328,
  backH: 304,
  nodes: [
    { id: "start", x: 24, y: 100, w: 96, h: 56 },
    { id: "open_capture", x: 150, y: 100, w: 145, h: 56 },
    { id: "photograph_label", x: 340, y: 98, w: 150, h: 60 },
    { id: "enter_manual", x: 340, y: 230, w: 150, h: 60 },
    { id: "extract_readable", x: 660, y: 83 },
    { id: "retake_photo", x: 615, y: 230, w: 145, h: 56 },
    { id: "confirm_identity", x: 820, y: 100, w: 145, h: 56 },
    { id: "attach_links", x: 1140, y: 100, w: 145, h: 56 },
    { id: "save_no_links", x: 1140, y: 230, w: 145, h: 56 },
    { id: "appliance_on_home", x: 1380, y: 100, w: 165, h: 56 },
    // Backend
    { id: "vision_extract", x: 340, y: 440, w: 165, h: 64 },
    { id: "vision_candidates", x: 550, y: 430, w: 160, h: 80 },
    { id: "search_links", x: 900, y: 440, w: 165, h: 64 },
    { id: "link_results", x: 1110, y: 430, w: 155, h: 80 },
    { id: "rank_attachments", x: 1310, y: 440, w: 155, h: 64 },
    { id: "return_links", x: 1510, y: 440, w: 145, h: 64 },
  ],
  edgePaths: {
    "open_capture>enter_manual>Skip": "M 222 156 V 260 H 340",
    "photograph_label>vision_extract>": "M 415 158 V 440",
    "vision_extract>vision_candidates>": "M 505 472 H 550",
    "vision_candidates>extract_readable>": "M 630 430 V 340 H 705 V 173",
    "extract_readable>confirm_identity>Yes": "M 750 128 H 820",
    "extract_readable>confirm_identity>Incomplete": "M 705 83 H 892 V 100",
    "extract_readable>retake_photo>No": "M 705 173 V 230",
    "retake_photo>photograph_label>": "M 687 286 H 415 V 158",
    "retake_photo>enter_manual>": "M 615 258 H 490",
    "enter_manual>confirm_identity>": "M 490 290 V 355 H 892 V 156",
    "confirm_identity>search_links>": "M 892 156 V 380 H 982 V 440",
    "search_links>link_results>": "M 1065 472 H 1110",
    "link_results>rank_attachments>": "M 1265 470 H 1310",
    "rank_attachments>return_links>": "M 1465 472 H 1510",
    "return_links>attach_links>": "M 1582 440 V 360 H 1212 V 156",
    "attach_links>appliance_on_home>": "M 1285 128 H 1380",
    "attach_links>save_no_links>Not found": "M 1212 156 V 230",
    "save_no_links>appliance_on_home>": "M 1285 258 H 1462 V 156",
  },
};
