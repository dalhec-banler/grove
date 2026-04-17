/-  *grove
|_  upd=update
++  grab
  |%
  ++  noun  update
  --
++  grow
  |%
  ++  noun  upd
  ++  json
    =,  enjs:format
    ^-  ^json
    |^
    ?-  -.upd
        %file-added      (file-meta-pairs 'fileAdded' file-meta.upd)
        %file-updated    (file-meta-pairs 'fileUpdated' file-meta.upd)
        %file-removed
      %-  pairs
      :~  ['type' s+'fileRemoved']
          ['fileId' s+(scot %uv id.upd)]
      ==
    ::
        %view-added
      %-  pairs
      :~  ['type' s+'viewAdded']
          ['name' s+name.upd]
          ['tags' [%a (turn ~(tap in tags.upd) |=(t=@tas s+(crip (trip t))))]]
          ['color' s+color.upd]
      ==
    ::
        %view-removed
      %-  pairs
      :~  ['type' s+'viewRemoved']
          ['name' s+name.upd]
      ==
    ::
        %share-added
      %-  pairs
      :~  ['type' s+'shareAdded']
          ['token' s+(scot %uv token.upd)]
          ['fileId' s+(scot %uv id.upd)]
      ==
    ::
        %share-removed
      %-  pairs
      :~  ['type' s+'shareRemoved']
          ['token' s+(scot %uv token.upd)]
      ==
    ::
        %allowed-updated
      %-  pairs
      :~  ['type' s+'allowedUpdated']
          ['fileId' s+(scot %uv id.upd)]
          ['ships' [%a (turn ~(tap in ships.upd) |=(p=@p s+(scot %p p)))]]
      ==
    ::
        %inbox-added
      %-  pairs
      :~  ['type' s+'inboxAdded']
          ['entry' (entry-json entry.upd)]
      ==
    ::
        %inbox-updated
      %-  pairs
      :~  ['type' s+'inboxUpdated']
          ['entry' (entry-json entry.upd)]
      ==
    ::
        %inbox-removed
      %-  pairs
      :~  ['type' s+'inboxRemoved']
          ['owner' s+(scot %p owner.upd)]
          ['fileId' s+(scot %uv id.upd)]
      ==
    ::
        %trusted-updated
      %-  pairs
      :~  ['type' s+'trustedUpdated']
          ['trusted' [%a (turn ~(tap in trusted.upd) |=(p=@p s+(scot %p p)))]]
          ['blocked' [%a (turn ~(tap in blocked.upd) |=(p=@p s+(scot %p p)))]]
      ==
    ::
        %cache-updated
      %-  pairs
      :~  ['type' s+'cacheUpdated']
          ['owner' s+(scot %p owner.upd)]
          ['meta' (file-meta-json file-meta.upd)]
      ==
    ::
        %cache-removed
      %-  pairs
      :~  ['type' s+'cacheRemoved']
          ['owner' s+(scot %p owner.upd)]
          ['fileId' s+(scot %uv id.upd)]
      ==
    ::
        %canopy-entry-added
      %-  pairs
      :~  ['type' s+'canopyEntryAdded']
          ['entry' (canopy-entry-json canopy-entry.upd)]
      ==
    ::
        %canopy-entry-removed
      %-  pairs
      :~  ['type' s+'canopyEntryRemoved']
          ['fileId' s+(scot %uv id.upd)]
      ==
    ::
        %canopy-config-updated
      %-  pairs
      :~  ['type' s+'canopyConfigUpdated']
          ['config' (canopy-config-json canopy-config.upd)]
      ==
    ::
        %canopy-peer-updated
      %-  pairs
      :~  ['type' s+'canopyPeerUpdated']
          ['listing' (canopy-listing-json canopy-listing.upd)]
      ==
    ::
        %canopy-peer-removed
      %-  pairs
      :~  ['type' s+'canopyPeerRemoved']
          ['host' s+(scot %p host.upd)]
      ==
    ::
        %view-shared
      %-  pairs
      :~  ['type' s+'viewShared']
          ['name' s+name.upd]
          ['allowed' [%a (turn ~(tap in allowed.upd) |=(p=@p s+(scot %p p)))]]
          :-  'group-flag'
          ?~  group-flag.upd  ~
          =/  gf  u.group-flag.upd
          %-  pairs
          :~  ['host' s+(scot %p -.gf)]
              ['name' s++.gf]
          ==
      ==
    ::
        %view-unshared
      %-  pairs
      :~  ['type' s+'viewUnshared']
          ['name' s+name.upd]
      ==
    ::
        %shared-view-updated
      %-  pairs
      :~  ['type' s+'sharedViewUpdated']
          :-  'listing'
          %-  pairs
          :~  ['host' s+(scot %p host.grove-view-listing.upd)]
              ['name' s+name.grove-view-listing.upd]
              ['tags' [%a (turn tags.grove-view-listing.upd |=(t=tag s+(crip (trip t))))]]
              ['color' s+color.grove-view-listing.upd]
              :-  'files'
              :-  %a
              %+  turn  files.grove-view-listing.upd
              |=  m=file-meta
              %-  pairs
              :~  ['id' s+(scot %uv id.m)]
                  ['name' s+name.m]
                  ['fileMark' s+(crip (trip file-mark.m))]
                  ['size' (numb size.m)]
                  ['tags' [%a (turn ~(tap in tags.m) |=(t=@tas s+(crip (trip t))))]]
                  ['created' s+(scot %da created.m)]
                  ['modified' s+(scot %da modified.m)]
                  ['description' s+description.m]
                  ['starred' b+starred.m]
              ==
          ==
      ==
    ::
        %shared-view-removed
      %-  pairs
      :~  ['type' s+'sharedViewRemoved']
          ['host' s+(scot %p host.upd)]
          ['name' s+name.upd]
      ==
    ==
    ::
    ++  canopy-entry-json
      |=  e=canopy-entry
      ^-  ^json
      %-  pairs
      :~  ['id' s+(scot %uv id.e)]
          ['displayName' s+display-name.e]
          ['fileMark' s+(crip (trip file-mark.e))]
          ['size' (numb size.e)]
          ['tags' [%a (turn ~(tap in tags.e) |=(t=@tas s+(crip (trip t))))]]
          ['published' s+(scot %da published.e)]
          ['description' s+description.e]
      ==
    ::
    ++  canopy-config-json
      |=  c=canopy-config
      ^-  ^json
      %-  pairs
      :~  ['mode' s+(crip (trip mode.c))]
          ['name' s+name.c]
          ['friends' [%a (turn ~(tap in friends.c) |=(p=@p s+(scot %p p)))]]
          :-  'group-flag'
          ?~  group-flag.c  ~
          =/  gf  u.group-flag.c
          %-  pairs
          :~  ['host' s+(scot %p -.gf)]
              ['name' s++.gf]
          ==
      ==
    ::
    ++  canopy-listing-json
      |=  l=canopy-listing
      ^-  ^json
      %-  pairs
      :~  ['host' s+(scot %p host.l)]
          ['name' s+name.l]
          ['mode' s+(crip (trip mode.l))]
          ['entries' [%a (turn entries.l canopy-entry-json)]]
      ==
    ::
    ++  entry-json
      |=  e=inbox-entry
      ^-  ^json
      %-  pairs
      :~  ['owner' s+(scot %p owner.e)]
          ['fileId' s+(scot %uv id.e)]
          ['name' s+name.e]
          ['fileMark' s+(crip (trip file-mark.e))]
          ['size' (numb size.e)]
          ['offered' s+(scot %da offered.e)]
          ['accepted' b+accepted.e]
      ==
    ::
    ++  file-meta-json
      |=  m=file-meta
      ^-  ^json
      %-  pairs
      :~  ['id' s+(scot %uv id.m)]
          ['name' s+name.m]
          ['fileMark' s+(crip (trip file-mark.m))]
          ['size' (numb size.m)]
          ['tags' [%a (turn ~(tap in tags.m) |=(t=@tas s+(crip (trip t))))]]
          ['created' s+(scot %da created.m)]
          ['modified' s+(scot %da modified.m)]
          ['description' s+description.m]
          ['starred' b+starred.m]
      ==
    ::
    ++  file-meta-pairs
      |=  [ty=@t m=file-meta]
      ^-  ^json
      %-  pairs
      :~  ['type' s+ty]
          ['fileId' s+(scot %uv id.m)]
          ['name' s+name.m]
          ['fileMark' s+(crip (trip file-mark.m))]
          ['size' (numb size.m)]
          ['tags' [%a (turn ~(tap in tags.m) |=(t=@tas s+(crip (trip t))))]]
          ['created' s+(scot %da created.m)]
          ['modified' s+(scot %da modified.m)]
          ['description' s+description.m]
          ['starred' b+starred.m]
      ==
    --
  --
++  grad  %noun
--
