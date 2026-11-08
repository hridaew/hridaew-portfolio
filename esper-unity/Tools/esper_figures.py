"""Blocked-out people for Live/scene.json: soft pills between joints, so a pose is just a list of points (metres).

joints needs: pelvis, neck, headBase, headTop; and for side l and r: sh, el, wr (arm), hip, kn, an (leg).
Every pose of a figure is built from the same parts, so Unity glides between poses (LiveFlip).
"""
import math


def limb(name, a, b, t, material="Figure", tint=None):
    """A pill from a to b, t thick."""
    d = [b[i] - a[i] for i in range(3)]
    n = math.sqrt(sum(v * v for v in d)) or 1e-4
    pitch = math.degrees(math.acos(max(-1, min(1, d[1] / n))))
    yaw = math.degrees(math.atan2(d[0], d[2]))
    item = {
        "id": name, "kind": "box", "material": material,
        "p": [round((a[i] + b[i]) / 2, 4) for i in range(3)],
        "r": [round(pitch, 2), round(yaw, 2), 0.0],
        "size": [t, round(n + t, 3), t], "radius": round(t / 2, 3),
    }
    if tint:
        item["tint"] = tint
    return item


def ball(name, at, d, material="Figure", tint=None):
    item = {"id": name, "kind": "box", "material": material, "p": [round(v, 4) for v in at], "size": [d, d, d], "radius": round(d / 2, 3)}
    if tint:
        item["tint"] = tint
    return item


def body(j, material="Figure", wear=None):
    """A slim, simple person: a round head clear of the shoulders, a tapered-looking torso pill, thin limbs.
    wear: optional tints by part group: torso, sleeves (upper arms), shorts (thighs)."""
    wear = wear or {}
    hb, ht = j["headBase"], j["headTop"]
    head = [(hb[i] + ht[i]) / 2 for i in range(3)]
    head[1] += 0.01
    parts = [limb("torso", j["pelvis"], j["neck"], 0.25, material, wear.get("torso")),
             ball("head", head, 0.2, material)]
    for side in ("l", "r"):
        parts += [
            limb(f"arm-{side}", j[f"sh{side}"], j[f"el{side}"], 0.068, material, wear.get("sleeves")),
            limb(f"fore-{side}", j[f"el{side}"], j[f"wr{side}"], 0.06, material),
            limb(f"thigh-{side}", j[f"hip{side}"], j[f"kn{side}"], 0.105, material, wear.get("shorts")),
            limb(f"shin-{side}", j[f"kn{side}"], j[f"an{side}"], 0.08, material),
        ]
    return parts


def figure(item_id, group, station, joints=None, frames=None, flip=0.0, material="Figure", wear=None, extras=None):
    """A person (shown only while the station is in use; station "" = always), built by the engine from joints:
    tapered limbs, hands, feet, head and hair. frames + flip loop key poses, gliding between them.
    extras(i, joints) -> props carried in each pose (a ball, a brush); they animate in step with the body."""
    poses = frames or [joints]
    item = {"id": item_id, "group": group, "kind": "person", "p": [0, 0, 0], "poses": poses}
    if frames:
        item["flip"] = flip
    if wear:
        item["wear"] = wear
    if station:
        item.update(station=station, when="active")
    if extras:
        if frames:
            item["children"] = [{"id": "props", "kind": "group", "p": [0, 0, 0], "flip": flip,
                                 "children": [{"id": f"pose-{i}", "kind": "group", "p": [0, 0, 0], "children": extras(i, f)} for i, f in enumerate(frames)]}]
        else:
            item["children"] = extras(0, joints)
    return item


# ---- poses ----

def pose(x, z, yaw):
    """Maps (side, up, forward) to world for someone at (x, z) turned yaw degrees from +z. Side is to their right."""
    a = math.radians(yaw)
    fx, fz = math.sin(a), math.cos(a)
    def P(side, up, fwd):
        return [round(x + side * fz + fwd * fx, 3), round(up, 3), round(z - side * fx + fwd * fz, 3)]
    return P


def legs(P, stance=0.13, up=0.92, drop=0.0, bend=0.02):
    return {
        "hipl": P(-0.1, up - drop, 0), "hipr": P(0.1, up - drop, 0),
        "knl": P(-stance, 0.48 - drop * 0.4, bend + drop * 0.5), "knr": P(stance, 0.48 - drop * 0.4, bend + drop * 0.5),
        "anl": P(-stance - 0.01, 0.05, 0), "anr": P(stance + 0.01, 0.05, 0),
    }


def upright(P, lean=0.0, drop=0.0, sway=0.0, nod=0.0):
    return {
        "pelvis": P(sway, 0.95 - drop, 0), "neck": P(sway * 2, 1.44 - drop, lean),
        "headBase": P(sway * 2.2, 1.52 - drop, lean * 1.2 + nod * 0.5), "headTop": P(sway * 2.8, 1.7 - drop, lean * 2 + nod),
        "shl": P(sway * 2 - 0.2, 1.4 - drop, lean), "shr": P(sway * 2 + 0.2, 1.4 - drop, lean),
    }


def seated(P):
    return {
        "pelvis": P(0, 0.5, 0), "neck": P(0, 0.96, 0.08), "headBase": P(0, 1.03, 0.1), "headTop": P(0, 1.2, 0.14),
        "shl": P(-0.2, 0.92, 0.08), "shr": P(0.2, 0.92, 0.08),
        "hipl": P(-0.1, 0.48, 0.02), "hipr": P(0.1, 0.48, 0.02),
        "knl": P(-0.14, 0.46, 0.42), "knr": P(0.14, 0.46, 0.42),
        "anl": P(-0.16, 0.05, 0.52), "anr": P(0.16, 0.05, 0.52),
    }


def arms(P, l_el, l_wr, r_el, r_wr):
    """Elbows and wrists as (side, up, forward) triples."""
    return {"ell": P(*l_el), "wrl": P(*l_wr), "elr": P(*r_el), "wrr": P(*r_wr)}
