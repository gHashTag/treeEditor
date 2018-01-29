/* @flow */

import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  AsyncStorage,
  LayoutAnimation
} from 'react-native'

import { tree } from './../constants'

export default class TreeElement extends Component {
  state = {
    tree: this.props.tree,
    name: this.props.name,
    parent_position: 0,
  }

  componentWillUpdate() {
    LayoutAnimation.spring()
  }

  renderTree = (children, margin_count, chain, changeChildrenQuantity) => {
    return (
      <View>
        {children.map((elem, index) => {
          const elem_chain = chain.slice()
          elem_chain.push(index)
          return (
            <TreeElement
              key={index}
              chain={elem_chain}
              margin_count={margin_count + 5}
              tree={elem}
              name={elem.name}
              changeChildrenQuantity={(position) => changeChildrenQuantity(position)}
            />
          )
        })}
      </View>
    )
  }
// TODO: release DRY principe for changeNodeName, add, remove functions - add same code from every function
//       to one function --> no boilerplate
  changeNodeNameInStorage = (current_tree_list, value, chain) => {
      let temp_tree_list = current_tree_list.slice()
      if (chain.length !== 1) {
        const next_chain = chain.slice(1)
        temp_tree_list[chain[0]].children = this.changeNodeNameInStorage(temp_tree_list[chain[0]].children, value, next_chain)
        return temp_tree_list
      }
      temp_tree_list[chain[0]].name = value
      return temp_tree_list
    }

    changeNodeName = async (value, chain) => {
      const tree_string_value = await AsyncStorage.getItem(tree)
      const current_tree_list = JSON.parse(tree_string_value)
      const new_tree_list = this.changeNodeNameInStorage(current_tree_list, value, chain)
      const new_tree_string_value = JSON.stringify(new_tree_list)
      AsyncStorage.setItem(tree, new_tree_string_value)
    }

    addToStorage = (current_tree_list, chain) => {
      let temp_tree_list = current_tree_list.slice()
      if (chain.length !== 1) {
        const next_chain = chain.slice(1)
        temp_tree_list[chain[0]].children = this.addToStorage(temp_tree_list[chain[0]].children, next_chain)
        return temp_tree_list
      }
      temp_tree_list[chain[0]].children.push({name: `Element`, children: []})
      return temp_tree_list
    }

     add = async (chain) => {
      const tree_string_value = await AsyncStorage.getItem(tree)
      const current_tree_list = JSON.parse(tree_string_value)
      const new_tree_list = this.addToStorage(current_tree_list, chain)
      const new_tree_string_value = JSON.stringify(new_tree_list)
      AsyncStorage.setItem(tree, new_tree_string_value)

      const new_tree = this.state.tree
      new_tree.children.push({name: `Element`, children: []})
      this.setState({tree: new_tree})
    }

    changeChildrenQuantity = (position) => {
      let temp_tree = this.state.tree
      temp_tree.children.splice(position, 1)
      this.setState({tree: temp_tree})
    }

    removeFromStorage = (current_tree_list, chain) => {
      let temp_tree_list = current_tree_list.slice()
      if (chain.length !== 1) {
        const next_chain = chain.slice(1)
        temp_tree_list[chain[0]].children = this.removeFromStorage(temp_tree_list[chain[0]].children, next_chain)
        return temp_tree_list
      }
      temp_tree_list.splice(chain[0], 1)
      this.setState({parent_position: chain[0]})
      return temp_tree_list
    }

    remove = async (chain) => {
      const tree_string_value = await AsyncStorage.getItem(tree)
      const current_tree_list = JSON.parse(tree_string_value)
      const new_tree_list = this.removeFromStorage(current_tree_list, chain)
      const new_tree_string_value = JSON.stringify(new_tree_list)
      AsyncStorage.setItem(tree, new_tree_string_value)
      let new_tree = this.state.tree
      new_tree.children = []
      this.setState({tree: new_tree})
      this.props.changeChildrenQuantity(this.state.parent_position)
    }

    render() {
      const { tree, name } = this.state
      const { margin_count, chain } = this.props
      return (
        <View style={{marginLeft: margin_count}}>
          <View style={styles.element_wrapper}>
            <View style={styles.element_name}>
              <TextInput
                underlineColorAndroid={`transparent`}
                style={[styles.text_content, {width: 90}]}
                editable={true}
                value={name}
                onChangeText={(text) => this.setState({name: text})}
                placeholder={`Введите что-нибудь`}
                onSubmitEditing={(/*event*/) => this.changeNodeName(/*event.nativeEvent.text*/name, chain)}
              />
            </View>
            <TouchableOpacity onPress={() => this.add(chain)}>
              <View style={[styles.center_alignment, styles.left_right_border, styles.button_padding]}>
                <Text style={styles.text_content}>+</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.remove(chain)}>
              <View style={[styles.center_alignment, styles.button_padding]}>
                <Text style={styles.text_content}>x</Text>
              </View>
            </TouchableOpacity>
          </View>
          {
            tree.children.length !== 0
            ? this.renderTree(tree.children, margin_count + 5, chain, (position) => this.changeChildrenQuantity(position))
            : null
          }
        </View>
      )
    }
}

const styles = StyleSheet.create({

  element_wrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#9ed870',
  },
  button_padding: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  text_content: {
    margin: 5,
    fontSize: 20,
  },
  center_alignment: {
    alignItems:'center',
    justifyContent: 'center',
  },
  left_right_border: {
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderRightColor: '#9ed870',
    borderLeftColor: '#9ed870',
  },
})
