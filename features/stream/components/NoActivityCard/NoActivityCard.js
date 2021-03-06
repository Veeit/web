import React from "react";
import { Link } from "~/routes";
import { actions as editorActions } from "../../../../ducks/editor";
import { connect } from "react-redux";
import Emoji from "../../../../components/Emoji";
import FullName from "../../../../components/FullName";
import OutboundLink from "../../../../components/OutboundLink";
import "./NoActivityCard.scss";

class NoActivityCard extends React.Component {
    render() {
        if (!this.props.user) return null;
        return (
            <div className="NoActivityCard card">
                <div className="card-content flex flex-v-gap flex-column has-text-centered">
                    <div>
                        <h1>
                            Welcome home, <FullName user={this.props.user} />!
                        </h1>
                        <h4 className="subtitle has-text-grey">
                            We're super happy to have you in our community.{" "}
                            <Emoji emoji="💚" />
                        </h4>
                    </div>
                    <div className="buttons flex flex-gap center">
                        <div>
                            <Link route="products">
                                <a className="btn btn-light">
                                    Add your products
                                </a>
                            </Link>
                        </div>
                        <div>
                            <Link route="apps">
                                <a className="btn btn-light">
                                    Set up integrations
                                </a>
                            </Link>
                        </div>
                        <div>
                            <OutboundLink to="https://t.me/makerlog">
                                <a className="btn btn-light">
                                    Join the Telegram
                                </a>
                            </OutboundLink>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => ({
    toggleEditor: () => dispatch(editorActions.toggleEditor())
});

export default connect(
    state => ({
        user: state.user.me
    }),
    mapDispatchToProps
)(NoActivityCard);
