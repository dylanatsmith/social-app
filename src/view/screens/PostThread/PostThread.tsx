import React, {useEffect, useMemo, useState} from 'react'
import {View} from 'react-native'
import {makeRecordUri} from '../../../lib/strings'
import {ViewHeader} from '../../com/util/ViewHeader'
import {PostThread as PostThreadComponent} from '../../com/post-thread/PostThread'
import {PostThreadViewModel} from '../../../state/models/post-thread-view'
import {ScreenParams} from '../../routes'
import {useStores} from '../../../state'

export default ({navIdx, visible, params}: ScreenParams) => {
  const store = useStores()
  const {name, rkey} = params
  const [viewSubtitle, setViewSubtitle] = useState<string>(`by ${name}`)
  const uri = makeRecordUri(name, 'app.bsky.feed.post', rkey)
  const view = useMemo<PostThreadViewModel>(
    () => new PostThreadViewModel(store, {uri}),
    [uri],
  )

  const setTitle = () => {
    const author = view.thread?.author
    const niceName = author?.handle || name
    setViewSubtitle(`by ${niceName}`)
    store.nav.setTitle(navIdx, `Post by ${niceName}`)
  }
  useEffect(() => {
    let aborted = false
    if (!visible) {
      return
    }
    setTitle()
    if (!view.hasLoaded && !view.isLoading) {
      console.log('Fetching post thread', uri)
      view.setup().then(
        () => {
          if (!aborted) {
            setTitle()
          }
        },
        err => {
          console.error('Failed to fetch thread', err)
        },
      )
    }
    return () => {
      aborted = true
    }
  }, [visible, store.nav, name])

  return (
    <View style={{flex: 1}}>
      <ViewHeader title="Post" subtitle={viewSubtitle} />
      <View style={{flex: 1}}>
        <PostThreadComponent uri={uri} view={view} />
      </View>
    </View>
  )
}