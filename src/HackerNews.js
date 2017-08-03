/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import StatusBarPaddingIOS from 'react-native-ios-status-bar-padding';
import Swipeout from 'react-native-swipeout';
import {
    Screen,
    View,
    ListView,
    Row,
    Subtitle,
    Caption,
    Divider,
    TextInput,
} from '@shoutem/ui';

const DEFAULT_QUERY = '';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_FRONTPAGE = 'https://hn.algolia.com/api/v1/search?tags=front_page'
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const DEFAULT_PAGE = 0;
const PARAM_HPP = 'hitsPerPage=';
const DEFAULT_HPP = 100;

export default class HackerNews extends Component {
    constructor(props) {
        super(props)
        this.state = {
            results: null,
            searchKey: '',
            searchTerm: DEFAULT_QUERY,
            isLoading: false,
        }
        this.renderRow = this.renderRow.bind(this)
        this.dismissItem = this.dismissItem.bind(this)
        this.setSearchTopstories = this.setSearchTopstories.bind(this)
        this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this)
        this.onTextChange = this.onTextChange.bind(this)
        this.needToFetchFromServer = this.needToFetchFromServer.bind(this)
        this.onSearchSubmit = this.onSearchSubmit.bind(this)
        this.renderHeader = this.renderHeader.bind(this)
    }

    setSearchTopstories(result) {
        const { hits, page } = result;
        this.setState(prevState => {
            const { searchKey, results } = prevState;
            const oldHits = results && results[searchKey]
                ? results[searchKey].hits
                : []
            const updateHits = [
                ...oldHits,
                ...hits
            ]

            return {
                results: {
                    ...results,
                    [searchKey]: { hits: updateHits, page }
                },
                isLoading: false
            }
        });
    }

    fetchSearchTopstories(searchTerm, page) {
        console.log("Search: " + searchTerm + "Page: " + page)
        this.setState({
            isLoading: true
        })
        const url = searchTerm === '' ?
            `${PATH_FRONTPAGE}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}` :
            `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`
        fetch(url)
            .then(response => response.json())
            .then(result => this.setSearchTopstories(result))
            .catch(e => e);
    }

    dismissItem(id) {
        const { results, searchKey } = this.state
        const { hits, page } = results[searchKey]
        const isNotId = item => item.objectID !== id;
        const updateList = hits.filter(isNotId);
        this.setState({
            results: {
                ...results,
                [searchKey]: { hits: updateList, page }
            }
        })
    }


    onTextChange(text) {
        this.setState({
            searchTerm: text
        })
    }

    needToFetchFromServer(searchTerm) {
        return !this.state.results[searchTerm]
    }

    onSearchSubmit() {
        const { searchTerm } = this.state
        this.setState({ searchKey: searchTerm })
        //console.log(searchTerm)
        if (this.needToFetchFromServer(searchTerm)) {
            this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE)
        }
    }

    componentDidMount() {
        const { searchTerm } = this.state;
        this.setState({
            searchKey: searchTerm
        })
        this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE)
    }

    renderHeader() {
        return (
            <TextInput
                placeholder={'Search...'}
                returnKeyType={'search'}
                onChangeText={this.onTextChange}
                onSubmitEditing={this.onSearchSubmit}>
            </TextInput>
        )
    }

    renderRow(item) {
        const swipeBtns = [{
            text: 'Delete',
            backgroundColor: 'red',
            underlayColor: 'rgba(0, 0, 0, 1)',
            onPress: () => { this.dismissItem(item.objectID) }
        }];
        return (
            <Swipeout right={swipeBtns}
                autoClose={true}
                backgroundColor='transparent'>
                <Row styleName='small' key={item.objectID}>
                    <View styleName='vertical'>
                        <Subtitle>
                            {item.title}
                        </Subtitle>
                        <View styleName='horizontal'>
                            <Caption style={{ flex: 0.4 }}>
                                {"Author: " + item.author}
                            </Caption>
                            <Caption style={{ flex: 0.3 }}>
                                {"Points: " + item.points}
                            </Caption>
                            <Caption style={{ flex: 0.3 }}>
                                {"Comments: " + item.num_comments}
                            </Caption>
                        </View>
                    </View>
                </Row>
                <Divider styleName="line" />
            </Swipeout>
        )
    }

    render() {
        const { results, searchTerm, searchKey, isLoading, isShowSearchBar } = this.state;
        const page = (results && results[searchKey] && results[searchKey].page) || 0
        const list = (results && results[searchKey] && results[searchKey].hits) || []
        return (
            <View>
                <StatusBarPaddingIOS />
                <ListView
                    loading={isLoading}
                    data={list}
                    renderHeader={this.renderHeader}
                    autoHideHeader={true}
                    renderRow={this.renderRow}
                    onLoadMore={() => this.fetchSearchTopstories(searchKey, page + 1)}>
                </ListView>
            </View>
        );
    }
}
