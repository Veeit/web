import "~/styles/index.scss";
import "~/vendor/fa";

import App, { Container } from "next/app";

import ErrorPage from "next/error";
import Head from "~/components/Head";
import NProgressContainer from "../vendor/nprogress";
import Page from "~/layouts/Page";

import createStore from "~/store";
import { Provider } from "react-redux";
import Reactor from "~/components/Reactor";
import withRedux from "next-redux-wrapper";
import withReduxSaga from "next-redux-saga";
import config, { isServer } from "~/config";
import { parseCookies } from "nookies";
import { actions as authActions } from "~/ducks/auth";
import { actions as userActions } from "~/ducks/user";
import { actions as appActions } from "~/ducks/app";
import axios from "~/lib/axios";
import DownPage from "~/layouts/DownPage";
import NotificationsView from "~/features/notifications/components/NotificationsView";
import ReactGA from "react-ga";
import isEmpty from "lodash/isEmpty";
import { gaSetUserId } from "../vendor/ga";

async function onStoreInit(ctx) {
    // only the sagas here are run on the server side; no async dependencies.
    const { token } = parseCookies(ctx);
    ctx.store.dispatch(appActions.requestApiHealth());
    if (token && token !== "" && token !== "null") {
        axios.defaults.headers.common["Authorization"] = `Token ${token}`;
        ctx.store.dispatch(authActions.login(null, null, token));
    } else {
        delete axios.defaults.headers.common["Authorization"];
    }
}

class Artemis extends App {
    static async getInitialProps({ Component, ctx }) {
        let pageProps = {};

        /* 
        THIS IS DANGEROUS!

        onStoreInit MUST run before getInitialProps, otherwise cross-request-state pollution may occur!
        
        oSI flushes previos request state (tokens) and clears stores. 

        This could be a serious security issue. 
        Do not touch this initialization code unless you know what you're doing.
        */

        if (onStoreInit && isServer) {
            // Loads onServerLoad - this is the place to put your cookie things.
            await onStoreInit(ctx);
        }

        if (typeof Component.getInitialProps === "function") {
            pageProps = await Component.getInitialProps(ctx);
        }

        if (!isServer) {
            ReactGA.pageview(ctx.asPath);
        }

        return { pageProps };
    }

    componentDidMount() {
        // rehydrate callbacks at reactor
        /*rehydrate(config, () => {
            if (this.props.store && this.props.store.app) {
                console.log("Artemis: ready.");
                this.props.store.app.setAppReady();
            }
        });*/
        // client-side only, run once on mount
        const currentUserState = this.props.store.getState().user.me;
        const currentAuthState = this.props.store.getState().auth;

        if (!config.isDev && config.GA_UA) {
            ReactGA.initialize(config.GA_UA);
            if (config.GO_TAG) ReactGA.ga("require", config.GO_TAG);
            ReactGA.pageview(window.location.pathname + window.location.search);

            // Now set tracking code for sessions.
            //!
            if (currentAuthState.loggedIn && !isEmpty(currentUserState)) {
                gaSetUserId(currentUserState);
            }
        }
    }

    render() {
        const { Component, pageProps, store } = this.props;
        const { statusCode } = pageProps;

        if (!store.getState().app.healthy) return <DownPage />;

        if (statusCode && statusCode >= 400) {
            return <ErrorPage statusCode={statusCode} />;
        }

        return (
            <Provider store={store}>
                <Head />
                <NProgressContainer spinner={false} />
                <div>
                    <Page {...pageProps.layout}>
                        <Component {...pageProps} />
                    </Page>

                    <Reactor />
                    <NotificationsView />
                </div>
            </Provider>
        );
    }
}

export default withRedux(createStore)(withReduxSaga(Artemis));
