import React from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  AsyncStorage,
  LayoutAnimation
} from 'react-native'

import TreeElement from './src/components/TreeElement'
import { tree } from './src/constants'

export default class App extends React.Component {
  state={
    tree: []
  }
  componentWillMount() {
    AsyncStorage.getItem(tree).then(result => {
      if (result !==  null) {
        parsedResult = JSON.parse(result)
        if (parsedResult.length === 0) {
          // NOTE: если не передавать tree, то сыплется предупреждение, что не найдена переменная tree.
          //Такое ощущение, что сторедж не видит подключенные через import переменные, когда внутри .then()
          // Вызывается какая-то ф-я, и вней обращаемся к import-переменным (а может, даже просто внутри .then)
          this.initialChangeStorage(tree)
        }
        else {
          this.setState({tree: parsedResult})
        }
      }
      else {
        this.initialChangeStorage(tree)
      }
    })
  }

  componentWillUpdate() {
    LayoutAnimation.spring()
  }

  initialChangeStorage = (tree) => {
    const initial_array = [{name: `Element`, children: []}]
    this.setState({tree: initial_array})
    AsyncStorage.setItem(tree, JSON.stringify(initial_array))
  }

  changeChildrenQuantity = (position) => {
    let temp_tree = this.state.tree
    temp_tree.splice(position, 1)
    this.setState({tree: temp_tree})
  }

  renderTree = (tree) => {
    // заглушка для первоначального рендера, когда стейт еще пустой
    if (tree.length === 0) {
      return null
    }
    const count = 0
    return (
      <View>
        <TreeElement
          margin_count={count}
          chain={[0]}
          tree={tree[0]}
          name={tree[0].name}
          changeChildrenQuantity={(position) => this.changeChildrenQuantity(position)}
        />
      </View>
    )
  }

  render() {
    const { tree } = this.state
    return (
      <View style={styles.container}>
        <ScrollView>
          <ScrollView horizontal>
            <View>
              {this.renderTree(tree)}
            </View>
          </ScrollView>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS === 'android' ? 24 : 50,
    backgroundColor: '#fff',
    height: 2000
  }
})
