/*
    This is the graph component that is rendered to show the users step data for the past six days
*/
import React from "react";
import { View } from "react-native";
import {connect} from 'react-redux'
import {Dimensions} from 'react-native';
import {BarChart} from 'react-native-chart-kit'

class StepCounter extends React.Component {
  
  render() {
    const data  = this.props.stepData
    const chartConfig = {
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      color: (opacity = 1) => `rgba(36, 113, 202, ${opacity})`,
      strokeWidth: 3
    }
    return (
      <View>
        <BarChart
          style={{marginVertical: 8, borderRadius: 16}}
          data={data}
          width={Dimensions.get('window').width - 3}
          height={220}
          chartConfig={chartConfig}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    stepData: state.stepData
  }
}

export default connect(mapStateToProps)(StepCounter);