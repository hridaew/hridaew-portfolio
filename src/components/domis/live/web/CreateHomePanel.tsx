"use client";

import {
  forwardRef,
  type CSSProperties,
  type Ref,
} from "react";
import {
  ADDRESS_ASSETS,
  ADDRESS_FULL,
  ADDRESS_PROFILE,
} from "@/components/domis/live/fixtures";
import "./create-home-panel.css";

export type CreateHomeManual = {
  street: string;
  apt: string;
  city: string;
  state: string;
  zip: string;
};

export type CreateHomePanelProps = {
  /** Text currently shown in the address search field. */
  addressText?: string;
  /** When true, address is “selected” (Places pick) — confirm + manual fill. */
  addressSelected?: boolean;
  /** Show typing caret in the search field. */
  typing?: boolean;
  /** Search field visually focused (cursor arrived). */
  fieldFocused?: boolean;
  enriching?: boolean;
  /** 0–100 silhouette fill while enriching. */
  enrichProgress?: number;
  enrichDone?: boolean;
  /** Brief confirm-button press state. */
  confirmPressed?: boolean;
  /**
   * 0–1 stagger for filled profile rows after enrich.
   * 0 = header only, 1 = all sections visible.
   */
  fieldsReveal?: number;
  manual?: CreateHomeManual;
  homeName?: string;
  homePhoto?: string | null;
  displayAddress?: string;
  bedrooms?: readonly string[];
  bathrooms?: readonly string[];
  details?: readonly string[];
  className?: string;
  style?: CSSProperties;
  addressFieldRef?: Ref<HTMLDivElement | null>;
  confirmButtonRef?: Ref<HTMLButtonElement | null>;
};

const DEFAULT_MANUAL: CreateHomeManual = {
  street: "",
  apt: "",
  city: "",
  state: "",
  zip: "",
};

const DEFAULT_BEDROOMS = [
  "Main Bedroom",
  "Guest Bedroom",
  "Secondary Bedroom",
] as const;

const DEFAULT_BATHROOMS = ["Main Bathroom", "Guest Bathroom"] as const;

const DEFAULT_DETAILS = [
  ADDRESS_PROFILE.roof,
  ADDRESS_PROFILE.heating,
] as const;

function MaterialIcon({
  name,
  color = "currentColor",
  size = 20,
}: {
  name: string;
  color?: string;
  size?: number;
}) {
  return (
    <span
      className="material-symbols-rounded"
      aria-hidden
      style={{
        color,
        fontSize: size,
        width: size,
        height: size,
      }}
    >
      {name}
    </span>
  );
}

function SilhouetteLoader({
  size = 96,
  progress = 0,
  src,
}: {
  size?: number;
  progress?: number;
  src: string;
}) {
  const clamped = Math.max(0, Math.min(100, progress));
  const maskStyle = {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  } as const;

  return (
    <div className="chp-loader" style={{ width: size, height: size }} aria-hidden>
      <img src={src} alt="" className="chp-loader-base" />
      <div className="chp-loader-mask" style={maskStyle}>
        <div className="chp-loader-fill" style={{ height: `${clamped}%` }}>
          <div className="chp-loader-tint" />
          <div className="chp-loader-wave" />
        </div>
      </div>
    </div>
  );
}

/**
 * Presentational Create Home Profile card — Lab CreateHomeProfilePanel surface.
 * Driven entirely by props; no network, no autoplay logic.
 */
export const CreateHomePanel = forwardRef<HTMLDivElement, CreateHomePanelProps>(
  function CreateHomePanel(
    {
      addressText = "",
      addressSelected = false,
      typing = false,
      fieldFocused = false,
      enriching = false,
      enrichProgress = 0,
      enrichDone = false,
      confirmPressed = false,
      fieldsReveal = 1,
      manual = DEFAULT_MANUAL,
      homeName = "Fillmore Home",
      homePhoto = ADDRESS_ASSETS.homeAvatar,
      displayAddress = ADDRESS_FULL,
      bedrooms = DEFAULT_BEDROOMS,
      bathrooms = DEFAULT_BATHROOMS,
      details = DEFAULT_DETAILS,
      className,
      style,
      addressFieldRef,
      confirmButtonRef,
    },
    ref
  ) {
    const hasAddress = addressSelected || Boolean(addressText.trim());
    const showConfirm = addressSelected;
    const showManualChrome = !addressSelected;
    const manualEmphasized =
      addressSelected ||
      Boolean(
        manual.street || manual.apt || manual.city || manual.state || manual.zip
      );
    const profileActive = enrichDone;
    const reveal = Math.max(0, Math.min(1, fieldsReveal));

    const showStats = reveal >= 0.25;
    const showBeds = reveal >= 0.45;
    const showBaths = reveal >= 0.65;
    const showDetails = reveal >= 0.85;

    const confirmLabel = enriching
      ? "Looking up home…"
      : enrichDone
        ? "Look up again"
        : "Confirm address";

    return (
      <div
        ref={ref}
        className={["domis-live", "chp", className].filter(Boolean).join(" ")}
        style={style}
      >
        <div className="chp-screen">
          <div className="chp-card">
            <div className="chp-form">
              <div>
                <p className="chp-title">Create Home Profile</p>
                <p className="chp-subtitle">Enter your address to get started</p>
              </div>

              <div className="chp-fields">
                <div
                  ref={addressFieldRef}
                  className="chp-search"
                  data-focused={fieldFocused || typing ? "true" : "false"}
                >
                  <MaterialIcon name="location_on" size={20} color="#818181" />
                  <div className="chp-search-input" aria-hidden>
                    {addressText || (
                      <span style={{ color: "var(--chp-muted)" }}>
                        Search for your address
                      </span>
                    )}
                    {typing ? <span className="chp-caret" /> : null}
                  </div>
                </div>

                {showManualChrome ? (
                  <div className="chp-divider">
                    <div className="chp-divider-line" />
                    <span className="chp-divider-label">or</span>
                    <div className="chp-divider-line" />
                  </div>
                ) : null}

                <div
                  className="chp-manual"
                  data-emphasized={manualEmphasized ? "true" : "false"}
                >
                  {showManualChrome ? (
                    <p className="chp-manual-label">Enter address manually</p>
                  ) : null}

                  <div className="chp-row">
                    <div className="chp-field chp-field-street">
                      <span className="chp-field-label">Street address</span>
                      <input
                        className="chp-input"
                        value={manual.street}
                        placeholder="Street address"
                        readOnly
                        tabIndex={-1}
                      />
                    </div>
                    <div className="chp-field chp-field-apt">
                      <span className="chp-field-label">Apt #</span>
                      <input
                        className="chp-input"
                        value={manual.apt}
                        placeholder="Apt #"
                        readOnly
                        tabIndex={-1}
                      />
                    </div>
                  </div>

                  <div className="chp-row">
                    <div className="chp-field chp-field-city">
                      <span className="chp-field-label">City</span>
                      <input
                        className="chp-input"
                        value={manual.city}
                        placeholder="City"
                        readOnly
                        tabIndex={-1}
                      />
                    </div>
                    <div className="chp-field chp-field-state">
                      <span className="chp-field-label">State</span>
                      <input
                        className="chp-input"
                        value={manual.state}
                        placeholder="ST"
                        readOnly
                        tabIndex={-1}
                      />
                    </div>
                    <div className="chp-field chp-field-zip">
                      <span className="chp-field-label">ZIP</span>
                      <input
                        className="chp-input"
                        value={manual.zip}
                        placeholder="ZIP"
                        readOnly
                        tabIndex={-1}
                      />
                    </div>
                  </div>
                </div>

                {showConfirm ? (
                  <div className="chp-confirm-wrap">
                    <button
                      ref={confirmButtonRef}
                      type="button"
                      className="chp-confirm"
                      data-pressed={confirmPressed ? "true" : "false"}
                      data-enriching={enriching ? "true" : "false"}
                      tabIndex={-1}
                    >
                      {confirmLabel}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="chp-preview">
              {!profileActive && !enriching ? (
                <div className="chp-preview-empty">
                  <img
                    src={ADDRESS_ASSETS.emptySilhouette}
                    alt=""
                    className="chp-silhouette"
                  />
                  {hasAddress && addressSelected ? (
                    <p className="chp-preview-hint">
                      Confirm your address to build this home profile
                    </p>
                  ) : null}
                </div>
              ) : enriching && !profileActive ? (
                <div className="chp-preview-enriching">
                  <SilhouetteLoader
                    size={96}
                    progress={enrichProgress}
                    src={ADDRESS_ASSETS.emptySilhouette}
                  />
                  <p className="chp-enrich-label">Looking up this home…</p>
                </div>
              ) : (
                <>
                  <div className="chp-profile">
                    <div className="chp-profile-inner">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 8,
                          width: "100%",
                        }}
                      >
                        <div className="chp-avatar">
                          <img
                            src={homePhoto || ADDRESS_ASSETS.emptySilhouette}
                            alt=""
                            style={
                              homePhoto
                                ? undefined
                                : { opacity: 0.4, objectFit: "contain" }
                            }
                          />
                        </div>
                        <p className="chp-home-name">{homeName}</p>
                        <p className="chp-home-address">{displayAddress}</p>
                      </div>

                      <div className="chp-stats">
                        <div
                          className="chp-stat"
                          data-visible={showStats ? "true" : "false"}
                        >
                          <MaterialIcon
                            name="design_services"
                            size={22}
                            color="#818181"
                          />
                          <div className="chp-stat-value">
                            <span>Built</span>
                            {ADDRESS_PROFILE.yearBuiltDisplay}
                          </div>
                        </div>
                        <div
                          className="chp-stat"
                          data-visible={showStats ? "true" : "false"}
                          style={{ transitionDelay: "60ms" }}
                        >
                          <MaterialIcon
                            name="square_foot"
                            size={22}
                            color="#818181"
                          />
                          <div className="chp-stat-value">
                            {ADDRESS_PROFILE.squareFootageDisplay}
                            <span>ft²</span>
                          </div>
                        </div>
                      </div>

                      <div
                        className="chp-section"
                        data-visible={showBeds ? "true" : "false"}
                      >
                        <p className="chp-section-title">
                          Bedrooms ({bedrooms.length})
                        </p>
                        <div className="chp-chips">
                          {bedrooms.map((name) => (
                            <div key={name} className="chp-chip">
                              <MaterialIcon
                                name="bed"
                                size={22}
                                color="#818181"
                              />
                              <p className="chp-chip-name">{name}</p>
                            </div>
                          ))}
                          <div className="chp-chip-add">
                            <MaterialIcon name="add" size={22} color="#c8c8c8" />
                            <span>Add bedroom</span>
                          </div>
                        </div>
                      </div>

                      <div
                        className="chp-section"
                        data-visible={showBaths ? "true" : "false"}
                      >
                        <p className="chp-section-title">
                          Bathrooms ({bathrooms.length})
                        </p>
                        <div className="chp-chips">
                          {bathrooms.map((name) => (
                            <div key={name} className="chp-chip">
                              <MaterialIcon
                                name="shower"
                                size={22}
                                color="#818181"
                              />
                              <p className="chp-chip-name">{name}</p>
                            </div>
                          ))}
                          <div className="chp-chip-add">
                            <MaterialIcon name="add" size={22} color="#c8c8c8" />
                            <span>Add bathroom</span>
                          </div>
                        </div>
                      </div>

                      <div
                        className="chp-section"
                        data-visible={showDetails ? "true" : "false"}
                      >
                        <p className="chp-section-title">
                          Additional Details ({details.length})
                        </p>
                        <div className="chp-chips">
                          {details.map((name) => (
                            <div key={name} className="chp-chip">
                              <MaterialIcon
                                name="home_repair_service"
                                size={22}
                                color="#818181"
                              />
                              <p className="chp-chip-name">{name}</p>
                            </div>
                          ))}
                          <div className="chp-chip-add">
                            <MaterialIcon name="add" size={22} color="#c8c8c8" />
                            <span>Add detail</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="chp-profile-fade" aria-hidden />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
