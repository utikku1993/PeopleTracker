import * as React from "react";
import { Text } from 'native-base';
import { View, StyleSheet } from 'react-native';

export default class ValidateForm extends React.Component {

    constructor(props, { }) {
        super(props);
    }

    render() {
        const {errors} = this.props;
        console.log(errors);
        return (
            <View>
                {errors.length > 0 && <Text style={styles.view}>{errors}
                </Text>}
            </View>
        );
    }
}
const styles = StyleSheet.create({
    view: {
        color: 'red'
    }
});
