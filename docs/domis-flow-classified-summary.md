# Domis flow classification summary

Shapes: `start_end` · `decision` · `process` · `data` · `input`

## Address intelligence (19 nodes)

### Owner
- `start` — start_end — Start (owner)
- `enter_address` — input — Enter address (owner)
- `autofill_ok` — decision — Autofill looks right? (owner)
- `choose_autofill` — process — Choose autofill (owner)
- `type_manual` — input — Type manually (owner)
- `wait_facts` — process — Wait for facts (owner)
- `useful_data` — decision — Useful data? (owner)
- `review_prefill` — process — Review prefill (owner)
- `leave_blanks` — process — Leave blanks (owner)
- `empty_form_manual` — input — Enter manually (owner)
- `edit_fields` — input — Edit fields (owner)
- `edit_photo` — input — Edit home photo (owner)
- `home_created` — start_end — Home created (owner)

### Backend / AI
- `resolve_address` — process — Resolve address (backend)
- `run_searches` — process — Run 3 searches (backend)
- `source_results` — data — Source results (backend)
- `cross_reference` — process — Cross-reference (backend)
- `consensus_payload` — data — Consensus payload (backend)
- `return_payload` — process — Return payload (backend)

### Shape counts (address)
| Shape | Count |
| --- | ---: |
| start_end | 2 |
| decision | 2 |
| process | 8 |
| data | 2 |
| input | 5 |

## Appliance intelligence (16 nodes)

### Owner
- `start` — start_end — Start (owner)
- `open_capture` — process — Open capture (owner)
- `photograph_label` — input — Photograph label (owner)
- `enter_manual` — input — Manual entry (owner)
- `extract_readable` — decision — Extract readable? (owner)
- `retake_photo` — process — Retake photo (owner)
- `confirm_identity` — process — Confirm identity (owner)
- `attach_links` — process — Attach links (owner)
- `save_no_links` — process — Save without links (owner)
- `appliance_on_home` — start_end — Appliance on home (owner)

### Backend / AI
- `vision_extract` — process — Vision extract (backend)
- `vision_candidates` — data — Vision candidates (backend)
- `search_links` — process — Search links (backend)
- `link_results` — data — Link results (backend)
- `rank_attachments` — process — Rank attachments (backend)
- `return_links` — process — Return links (backend)

### Shape counts (appliance)
| Shape | Count |
| --- | ---: |
| start_end | 2 |
| decision | 1 |
| process | 9 |
| data | 2 |
| input | 2 |
