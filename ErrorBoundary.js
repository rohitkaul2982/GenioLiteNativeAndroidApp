import React from "react";

import { View, Text, Image } from "react-native";



export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: false,
            message: ""
        };
    }
    componentDidCatch(err, errInfo) {
        console.log(err);
        alert(errInfo);
        this.setState({
            error: true,
            message: errInfo.componentStack.toString()
        });
    }

    render() {
        if (this.state.error) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={{ textAlign: "center", fontSize: 16, padding: 10 }}>
                        Something Went Wrong. Try Again Later
                    </Text>
                    
                        <Text style={{ textAlign: "center", fontSize: 8, padding: 10 }}>
                            {this.state.message}
                        </Text>
                    
                </View>
            );
        }
        return this.props.children;
    }
}

const styles = {
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
};