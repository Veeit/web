import { updateSettings } from "~/lib/user";
import { Link } from "~/routes";

import Dropzone from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Spinner from "~/components/Spinner";
import omit from "lodash/omit";
import { loadingClass } from "../../../lib/utils/random";
import { getPrivilegedUser } from "../../../lib/user";

class ProfileTab extends React.Component {
    state = {
        saved: false,
        isLoading: true,
        isPosting: false,
        first_name: "",
        last_name: "",
        status: "",
        description: "",
        twitter_handle: "",
        instagram_handle: "",
        telegram_handle: "",
        product_hunt_handle: "",
        shipstreams_handle: "",
        nomadlist_handle: "",
        bmc_handle: "",
        website: "",
        github_handle: "",
        avatar: null,
        avatarUploading: false,
        avatarPreviewUrl: null,
        header: null,
        headerUploading: false,
        headerPreviewUrl: null,
        digest: true,
        email_notifications: true,
        errorMessages: null,
        accent: ""
    };

    fieldsToExclude = [
        "isLoading",
        "isPosting",
        "avatarPreviewUrl",
        "headerPreviewUrl"
    ];

    componentDidMount() {
        this.prefillFields();
    }

    onSubmit = async event => {
        event.preventDefault();
        if (this.state.description.length >= 50) {
            this.setState({
                errorMessages: { Tagline: "Maximum 50 characters." }
            });
            return null;
        }

        this.setState({ isPosting: true });
        try {
            const formData = omit(this.state, this.fieldsToExclude);
            const user = await updateSettings(formData);
            if (this.props.updateUser) {
                this.props.updateUser(user);
            }
            this.setState({ isPosting: false, saved: true });
        } catch (e) {
            if (e.field_errors) {
                this.setState({
                    isPosting: false,
                    errorMessages: e.field_errors,
                    saved: false
                });
            }
        }
    };

    onAvatarUpload = (acceptedFiles, rejectedFiles) => {
        const file = acceptedFiles[0];
        const reader = new FileReader();

        this.setState({
            avatarUploading: true
        });

        reader.onloadend = e => {
            this.setState({
                avatar: file,
                avatarPreviewUrl: reader.result,
                avatarUploading: false
            });
        };
        reader.readAsDataURL(file);
    };

    onHeaderUpload = (acceptedFiles, rejectedFiles) => {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);

        this.setState({
            headerUploading: true
        });

        reader.onloadend = e => {
            this.setState({
                header: file,
                headerUploading: false,
                headerPreviewUrl: reader.result
            });
        };
    };

    prefillFields = async () => {
        try {
            const data = await getPrivilegedUser();
            this.setState({
                isLoading: false,
                first_name: data.first_name || "",
                last_name: data.last_name || "",
                status: data.status || "",
                description: data.description || "",
                twitter_handle: data.twitter_handle || "",
                instagram_handle: data.instagram_handle || "",
                telegram_handle: data.telegram_handle || "",
                product_hunt_handle: data.product_hunt_handle || "",
                shipstreams_handle: data.shipstreams_handle || "",
                nomadlist_handle: data.nomadlist_handle || "",
                github_handle: data.github_handle || "",
                bmc_handle: data.bmc_handle || "",
                website: data.website || "",
                avatarPreviewUrl: data.avatar,
                headerPreviewUrl: data.header,
                digest: data.digest,
                email_notifications: data.email_notifications
            });
        } catch (e) {}
    };

    renderErrorMessages = () => {
        let messages = [];
        let errors = this.state.errorMessages;
        if (typeof errors === "object") {
            for (let key in errors) {
                messages.push(
                    <p>
                        <strong>{key.replace(/[_-]/g, " ")}</strong>:{" "}
                        {errors[key]}
                    </p>
                );
            }

            return messages;
        } else if (errors.constructor === Array) {
            errors.map(err => {
                messages.push(<p>{err}</p>);

                return true;
            });
        } else {
            return <p>{errors}</p>;
        }

        return messages;
    };

    render() {
        if (this.state.isLoading)
            return (
                <div className={"center"}>
                    <Spinner text={"Loading your settings..."} />
                </div>
            );

        return (
            <form onSubmit={this.onSubmit}>
                <div className={"grid-2c grid-gap"}>
                    <div>
                        <div className={"form-row"}>
                            <label className="label">First name</label>
                            <div className={"control"}>
                                <input
                                    type={"text"}
                                    className="input"
                                    value={this.state.first_name}
                                    placeholder="Your first name"
                                    onChange={e =>
                                        this.setState({
                                            first_name: e.target.value
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <div className={"form-row"}>
                            <label className="label">Last name</label>
                            <div className={"control"}>
                                <input
                                    type={"text"}
                                    value={this.state.last_name}
                                    placeholder="Your last name"
                                    onChange={e =>
                                        this.setState({
                                            last_name: e.target.value
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <div className={"form-row"}>
                            <label className="label">Tagline</label>
                            <div className={"control"}>
                                <input
                                    type={"text"}
                                    value={this.state.description}
                                    placeholder="Your tagline. Keep it short (max 50 chars.)"
                                    onChange={e =>
                                        this.setState({
                                            description: e.target.value
                                        })
                                    }
                                />
                                {this.state.description.length >= 50 && (
                                    <span className={"has-text-danger"}>
                                        Too long!
                                    </span>
                                )}
                            </div>
                        </div>
                        <label className="label">Website</label>
                        <div className={"form-row"}>
                            <div className={"control"}>
                                <input
                                    type={"text"}
                                    value={this.state.website}
                                    placeholder="https://getmakerlog.com"
                                    onChange={e =>
                                        this.setState({
                                            website: e.target.value
                                        })
                                    }
                                />
                            </div>
                            <p className="help">
                                This will add a nice button to your profile.
                            </p>
                        </div>
                        <br />

                        <label className="label">Weekly digest</label>
                        <div className={"form-row"}>
                            <div className={"control"}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={this.state.digest}
                                        onChange={e =>
                                            this.setState({
                                                digest: e.target.checked
                                            })
                                        }
                                    />{" "}
                                    Send newsletters
                                </label>
                            </div>
                            <p className="help">
                                Stay in the loop with a digests and blog posts
                                chock-full of launches, achievements and weekly
                                interviews.
                            </p>
                        </div>

                        <br />

                        <label className="label">Email notifications</label>
                        <div className={"form-row"}>
                            <div className={"control"}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={this.state.email_notifications}
                                        onChange={e =>
                                            this.setState({
                                                email_notifications:
                                                    e.target.checked
                                            })
                                        }
                                    />{" "}
                                    Send email notifications
                                </label>
                            </div>
                            <p className="help">
                                We'll send you notifications when important
                                things happen on-site.
                            </p>
                        </div>

                        <br />

                        <div className={"form-row"}>
                            <label className="label">Profile picture</label>
                            <Dropzone
                                maxSize={2 * 1024 * 1024}
                                className={"ProductIconPicker"}
                                accept="image/*"
                                multiple={false}
                                onDrop={this.onAvatarUpload}
                            >
                                {this.state.avatarPreviewUrl ? (
                                    <figure className="is-square is-64x64">
                                        <img
                                            style={{ height: 64, width: 64 }}
                                            className={"image"}
                                            src={this.state.avatarPreviewUrl}
                                        />
                                    </figure>
                                ) : this.state.avatarUploading ? (
                                    <Spinner small />
                                ) : (
                                    <FontAwesomeIcon icon={"camera"} />
                                )}
                            </Dropzone>
                        </div>
                    </div>
                    <div>
                        <label className="label">Twitter handle</label>
                        <div className={"form-row has-addons"}>
                            <div className={"control"}>
                                <input
                                    type={"text"}
                                    value={this.state.twitter_handle}
                                    placeholder="getmakerlog"
                                    onChange={e =>
                                        this.setState({
                                            twitter_handle: e.target.value
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <label className="label">Telegram handle</label>
                        <div className={"form-row has-addons"}>
                            <div className={"control"}>
                                <input
                                    type={"text"}
                                    value={this.state.telegram_handle}
                                    placeholder="matteing"
                                    onChange={e =>
                                        this.setState({
                                            telegram_handle: e.target.value
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <label className="label">Instagram handle</label>
                        <div className={"form-row has-addons"}>
                            <div className={"control"}>
                                <input
                                    type={"text"}
                                    value={this.state.instagram_handle}
                                    placeholder="johndoe"
                                    onChange={e =>
                                        this.setState({
                                            instagram_handle: e.target.value
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <label className="label">Product Hunt handle</label>
                        <div className={"form-row has-addons"}>
                            <div className={"control"}>
                                <input
                                    type={"text"}
                                    value={this.state.product_hunt_handle}
                                    placeholder="ftxdri"
                                    onChange={e =>
                                        this.setState({
                                            product_hunt_handle: e.target.value
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <label className="label">GitHub handle</label>
                        <div className={"form-row has-addons"}>
                            <div className={"control"}>
                                <input
                                    type={"text"}
                                    value={this.state.github_handle}
                                    placeholder="matteing"
                                    onChange={e =>
                                        this.setState({
                                            github_handle: e.target.value
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <label className="label">Twitch handle</label>
                        <div className={"form-row"}>
                            <div className={"has-addons"}>
                                <div className={"control"}>
                                    <input
                                        type={"text"}
                                        value={this.state.shipstreams_handle}
                                        placeholder="sergiomattei"
                                        onChange={e =>
                                            this.setState({
                                                shipstreams_handle:
                                                    e.target.value
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <p className="help">
                                This will turn on the Shipstreams integration.{" "}
                                <Link
                                    route="apps"
                                    params={{ app: "shipstreams" }}
                                >
                                    Learn more
                                </Link>
                            </p>
                        </div>

                        <label className="label">NomadList handle</label>
                        <div className={"form-row"}>
                            <div className={"has-addons"}>
                                <div className={"control"}>
                                    <input
                                        type={"text"}
                                        value={this.state.nomadlist_handle}
                                        placeholder="levelsio"
                                        onChange={e =>
                                            this.setState({
                                                nomadlist_handle: e.target.value
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <p className="help">
                                This will turn on the NomadList integration in
                                your profile page.
                            </p>
                        </div>

                        <label className="label">Buy Me A Coffee handle</label>
                        <div className={"form-row"}>
                            <div className={"has-addons"}>
                                <div className={"control"}>
                                    <input
                                        type={"text"}
                                        value={this.state.bmc_handle}
                                        placeholder="mattei"
                                        onChange={e =>
                                            this.setState({
                                                bmc_handle: e.target.value
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <p className="help">
                                This will add a donate button to your profile.
                            </p>
                        </div>
                    </div>
                </div>
                <br />

                {this.state.saved && (
                    <div className="alert is-success mbGap">
                        <div className="alert-body">Saved.</div>
                    </div>
                )}

                {this.state.errorMessages && (
                    <div className={"alert is-danger mbGap"}>
                        <div className="alert-body">
                            {this.renderErrorMessages()}
                        </div>
                    </div>
                )}

                <button
                    className={loadingClass(
                        "btn btn-primary",
                        this.state.isPosting
                    )}
                    onClick={this.onSubmit}
                    type="submit"
                >
                    Save
                </button>
            </form>
        );
    }
}

export default ProfileTab;
