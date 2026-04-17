/-  *grove
/+  default-agent, dbug
|%
+$  card  card:agent:gall
+$  file-meta-0
  $:  id=@uvH
      name=@t
      file-mark=@tas
      size=@ud
      tags=(set @tas)
      created=@da
      modified=@da
      description=@t
      starred=?
  ==
+$  file-meta-1
  $:  id=@uvH
      name=@t
      object-key=@t
      file-mark=@tas
      size=@ud
      tags=(set @tas)
      created=@da
      modified=@da
      description=@t
      starred=?
  ==
+$  state-0  [%0 f=(map @uvH file-meta-0) d=(map @uvH @) v=(map @t [(set @tas) @t]) s=(map @uvH @t)]
+$  state-1  [%1 f=(map @uvH file-meta-1) v=(map @t [(set @tas) @t]) s=(map @uvH @uvH)]
+$  state-2
  $:  %2
      f=(map file-id file-meta)
      b=(map file-id octs)
      v=(map @t [(set tag) @t])
      s=(map share-token file-id)
  ==
+$  state-3
  $:  %3
      f=(map file-id file-meta)
      b=(map file-id octs)
      v=(map @t [(set tag) @t])
      s=(map share-token file-id)
      al=(map file-id (set @p))
  ==
+$  state-4
  $:  %4
      f=(map file-id file-meta)
      b=(map file-id octs)
      v=(map @t [(set tag) @t])
      s=(map share-token file-id)
      al=(map file-id (set @p))
      inbox=(map [@p file-id] inbox-entry)
      trusted=(set @p)
      blocked=(set @p)
      cache=(map [@p file-id] [file-meta octs])
  ==
+$  state-5
  $:  %5
      f=(map file-id file-meta)
      b=(map file-id octs)
      v=(map @t [(set tag) @t])
      s=(map share-token file-id)
      al=(map file-id (set @p))
      inbox=(map [@p file-id] inbox-entry)
      trusted=(set @p)
      blocked=(set @p)
      cache=(map [@p file-id] [file-meta octs])
      canopy=(map file-id canopy-entry)
      cfg=[mode=?(%open %friends) friends=(set @p) name=@t]
      peers=(map @p canopy-listing)
      subs=(set @p)
  ==
+$  state-6
  $:  %6
      f=(map file-id file-meta)
      b=(map file-id octs)
      v=(map @t [(set tag) @t])
      s=(map share-token file-id)
      al=(map file-id (set @p))
      inbox=(map [@p file-id] inbox-entry)
      trusted=(set @p)
      blocked=(set @p)
      cache=(map [@p file-id] [file-meta octs])
      canopy=(map file-id canopy-entry)
      cfg=canopy-config
      peers=(map @p canopy-listing)
      subs=(set @p)
  ==
+$  versioned-state  $%(state-6 state-5 state-4 state-3 state-2 state-1 state-0)
--
%-  agent:dbug
=|  state-6
=*  state  -
^-  agent:gall
|_  =bowl:gall
+*  this  .
    def  ~(. (default-agent this %|) bowl)
++  on-init
  :_  this
  :~  [%pass /bind-share %arvo %e %connect [~ /grove-share] %grove]
      [%pass /bind-file %arvo %e %connect [~ /grove-file] %grove]
      [%pass /bind-remote %arvo %e %connect [~ /grove-remote-file] %grove]
  ==
++  on-save  !>(state)
++  on-load
  |=  old-vase=vase
  ^-  (quip card _this)
  =/  old  !<(versioned-state old-vase)
  |^
  ?-  -.old
      %6
    :_  this(state old)
    :~  [%pass /bind-share %arvo %e %connect [~ /grove-share] %grove]
        [%pass /bind-file %arvo %e %connect [~ /grove-file] %grove]
        [%pass /bind-remote %arvo %e %connect [~ /grove-remote-file] %grove]
    ==
    ::
    %5  $(old (five-to-six old))
    %4  $(old (four-to-five old))
    %3  $(old (three-to-four old))
    %2  $(old (two-to-three old))
    %1  $(old (one-to-two old))
    %0  $(old (zero-to-one old))
  ==
  ::
  ++  two-to-three
    |=  s=state-2
    ^-  state-3
    [%3 f=f.s b=b.s v=v.s s=s.s al=~]
  ::
  ++  three-to-four
    |=  s=state-3
    ^-  state-4
    [%4 f=f.s b=b.s v=v.s s=s.s al=al.s inbox=~ trusted=~ blocked=~ cache=~]
  ::
  ++  five-to-six
    |=  s=state-5
    ^-  state-6
    :*  %6  f=f.s  b=b.s  v=v.s  s=s.s  al=al.s  inbox=inbox.s
        trusted=trusted.s  blocked=blocked.s  cache=cache.s
        canopy=canopy.s
        cfg=[mode=mode.cfg.s friends=friends.cfg.s name=name.cfg.s group-flag=~]
        peers=peers.s  subs=subs.s
    ==
  ::
  ++  four-to-five
    |=  s=state-4
    ^-  state-5
    :*  %5  f=f.s  b=b.s  v=v.s  s=s.s  al=al.s  inbox=inbox.s
        trusted=trusted.s  blocked=blocked.s  cache=cache.s
        canopy=~  cfg=[mode=%open friends=~ name='']  peers=~  subs=~
    ==
  ::
  ++  zero-to-one
    |=  s=state-0
    ^-  state-1
    =/  migrated-f=(map @uvH file-meta-1)
      %-  ~(gas by *(map @uvH file-meta-1))
      %+  turn  ~(tap by f.s)
      |=  [i=@uvH m=file-meta-0]
      :-  i
      ^-  file-meta-1
      :*  id.m  name.m  ''  file-mark.m  size.m
          tags.m  created.m  modified.m  description.m  starred.m
      ==
    [%1 migrated-f v.s ~]
  ::
  ++  one-to-two
    |=  s=state-1
    ^-  state-2
    =/  migrated-f=(map file-id file-meta)
      %-  ~(gas by *(map file-id file-meta))
      %+  turn  ~(tap by f.s)
      |=  [i=@uvH m=file-meta-1]
      :-  `file-id`i
      ^-  file-meta
      :*  id.m  name.m  file-mark.m  size.m
          tags.m  created.m  modified.m  description.m  starred.m
      ==
    [%2 migrated-f ~ v.s s.s]
  --
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  |^
  ?+  mark  (on-poke:def mark vase)
      %grove-action
    =/  a  !<(action vase)
    ?:  ?=(%offer -.a)
      ?<  =(our.bowl src.bowl)
      =^  cards=(list card)  state
        (handle-offer src.bowl entry.a)
      [cards this]
    ?>  =(our.bowl src.bowl)
    =^  cards=(list card)  state
      (handle-action a)
    [cards this]
  ::
      %handle-http-request
    (handle-http !<([@ta inbound-request:eyre] vase))
  ==
  ::
  ++  handle-action
    |=  a=action
    ^-  (quip card _state)
    ?-  -.a
        %upload
      =/  i=file-id  (sham [eny.bowl now.bowl name.a])
      =/  fm=file-meta
        :*  i  name.a  file-mark.a  p.data.a
            tags.a  now.bowl  now.bowl  ''  |
        ==
      :-  (fact-update [%file-added fm])
      %_  state
        f  (~(put by f) i fm)
        b  (~(put by b) i data.a)
      ==
    ::
        %delete
      ?.  (~(has by f) id.a)  `state
      :-  (fact-update [%file-removed id.a])
      %_  state
        f  (~(del by f) id.a)
        b  (~(del by b) id.a)
      ==
    ::
        %rename
      ?.  (~(has by f) id.a)  `state
      =/  o  (~(got by f) id.a)
      =/  new-fm  o(name name.a, modified now.bowl)
      :-  (fact-update [%file-updated new-fm])
      state(f (~(put by f) id.a new-fm))
    ::
        %toggle-star
      ?.  (~(has by f) id.a)  `state
      =/  o  (~(got by f) id.a)
      =/  new-fm  o(starred !starred.o)
      :-  (fact-update [%file-updated new-fm])
      state(f (~(put by f) id.a new-fm))
    ::
        %add-tags
      ?.  (~(has by f) id.a)  `state
      =/  o  (~(got by f) id.a)
      =/  new-fm  o(tags (~(uni in tags.o) tags.a))
      :-  (fact-update [%file-updated new-fm])
      state(f (~(put by f) id.a new-fm))
    ::
        %remove-tags
      ?.  (~(has by f) id.a)  `state
      =/  o  (~(got by f) id.a)
      =/  new-fm  o(tags (~(dif in tags.o) tags.a))
      :-  (fact-update [%file-updated new-fm])
      state(f (~(put by f) id.a new-fm))
    ::
        %mkview
      :-  (fact-update [%view-added name.a tags.a color.a])
      state(v (~(put by v) name.a [tags.a color.a]))
    ::
        %rmview
      ?.  (~(has by v) name.a)  `state
      :-  (fact-update [%view-removed name.a])
      state(v (~(del by v) name.a))
    ::
        %share
      ?.  (~(has by f) id.a)  `state
      =/  tk=share-token  (sham [eny.bowl now.bowl id.a])
      :-  (fact-update [%share-added tk id.a])
      state(s (~(put by s) tk id.a))
    ::
        %unshare
      ?.  (~(has by s) token.a)  `state
      :-  (fact-update [%share-removed token.a])
      state(s (~(del by s) token.a))
    ::
        %set-allowed
      ?.  (~(has by f) id.a)  `state
      =/  prev  (~(gut by al) id.a *(set @p))
      =/  added  (~(dif in ships.a) prev)
      =/  fm  (~(got by f) id.a)
      =/  entry=inbox-entry
        :*  owner=our.bowl  id=id.a  name=name.fm  file-mark=file-mark.fm
            size=size.fm  offered=now.bowl  accepted=|
        ==
      =/  offer-cards=(list card)
        %+  turn  ~(tap in added)
        |=  who=@p
        ^-  card
        :*  %pass  /offer/(scot %p who)/(scot %uv id.a)
            %agent  [who %grove]  %poke
            %grove-action  !>(`action`[%offer entry])
        ==
      ::  if notify, ensure a share token exists and DM each added ship
      =/  tk-existing=(unit share-token)
        =/  pairs  ~(tap by s)
        |-  ^-  (unit share-token)
        ?~  pairs  ~
        ?:  =(id.a +.i.pairs)  `-.i.pairs
        $(pairs t.pairs)
      =/  new-tk=share-token
        ?^  tk-existing  u.tk-existing
        (sham [eny.bowl now.bowl id.a])
      =/  share-cards=(list card)
        ?:  ?|  !notify.a  =(0 ~(wyt in added))  ?=(^ tk-existing)  ==
          ~
        (fact-update [%share-added new-tk id.a])
      =/  notify-cards=(list card)
        ?.  notify.a  ~
        %+  turn  ~(tap in added)
        |=  who=@p
        ^-  card
        (dm-notify who new-tk name.fm)
      =/  new-s
        ?:  ?|  !notify.a  ?=(^ tk-existing)  =(0 ~(wyt in added))  ==
          s
        (~(put by s) new-tk id.a)
      :-  :(weld (fact-update [%allowed-updated id.a ships.a]) offer-cards share-cards notify-cards)
      state(al (~(put by al) id.a ships.a), s new-s)
    ::
        %offer
      ::  only foreign ships hit this; routed via top-level %offer guard
      `state
    ::
        %accept-offer
      =/  k=[@p file-id]  [owner.a id.a]
      =/  ent  (~(get by inbox) k)
      ?~  ent  `state
      =/  new  u.ent(accepted &)
      :-  (fact-update [%inbox-updated new])
      state(inbox (~(put by inbox) k new))
    ::
        %decline-offer
      =/  k=[@p file-id]  [owner.a id.a]
      ?.  (~(has by inbox) k)  `state
      :-  (fact-update [%inbox-removed owner.a id.a])
      state(inbox (~(del by inbox) k))
    ::
        %trust-ship
      =/  new-trusted  (~(put in trusted) who.a)
      =/  new-blocked  (~(del in blocked) who.a)
      :-  (fact-update [%trusted-updated new-trusted new-blocked])
      state(trusted new-trusted, blocked new-blocked)
    ::
        %untrust-ship
      =/  new-trusted  (~(del in trusted) who.a)
      :-  (fact-update [%trusted-updated new-trusted blocked])
      state(trusted new-trusted)
    ::
        %block-ship
      =/  new-blocked  (~(put in blocked) who.a)
      =/  new-trusted  (~(del in trusted) who.a)
      :-  (fact-update [%trusted-updated new-trusted new-blocked])
      state(trusted new-trusted, blocked new-blocked)
    ::
        %unblock-ship
      =/  new-blocked  (~(del in blocked) who.a)
      :-  (fact-update [%trusted-updated trusted new-blocked])
      state(blocked new-blocked)
    ::
        %fetch
      =/  wire=path  /fetch/(scot %p owner.a)/(scot %uv id.a)
      :_  state
      :~  [%pass wire %agent [owner.a %grove] %leave ~]
          [%pass wire %agent [owner.a %grove] %watch /file/(scot %uv id.a)]
      ==
    ::
        %plant
      =/  k=[@p file-id]  [owner.a id.a]
      =/  c  (~(get by cache) k)
      ?~  c  `state
      =/  meta  -.u.c
      =/  data  +.u.c
      =/  new-id=file-id  (sham [eny.bowl now.bowl id.a owner.a])
      =/  new-fm=file-meta
        meta(id new-id, created now.bowl, modified now.bowl)
      :-  (fact-update [%file-added new-fm])
      %_  state
        f  (~(put by f) new-id new-fm)
        b  (~(put by b) new-id data)
      ==
    ::
        %drop-cache
      =/  k=[@p file-id]  [owner.a id.a]
      ?.  (~(has by cache) k)  `state
      :-  (fact-update [%cache-removed owner.a id.a])
      state(cache (~(del by cache) k))
    ::
        %publish
      ?.  (~(has by f) id.a)  `state
      =/  fm  (~(got by f) id.a)
      =/  nm=@t  ?:(=('' display-name.a) name.fm display-name.a)
      =/  ent=canopy-entry
        :*  id=id.a  display-name=nm  file-mark=file-mark.fm
            size=size.fm  tags=tags.a  published=now.bowl
            description=description.a
        ==
      :_  state(canopy (~(put by canopy) id.a ent))
      %+  weld  (fact-update [%canopy-entry-added ent])
      (canopy-broadcast state(canopy (~(put by canopy) id.a ent)))
    ::
        %unpublish
      ?.  (~(has by canopy) id.a)  `state
      =/  new-canopy  (~(del by canopy) id.a)
      :_  state(canopy new-canopy)
      %+  weld  (fact-update [%canopy-entry-removed id.a])
      (canopy-broadcast state(canopy new-canopy))
    ::
        %set-canopy-mode
      =/  new-cfg  cfg(mode mode.a)
      =/  kick-cards=(list card)
        ?.  &(=(mode.a %friends) !=(mode.cfg %friends))  ~
        ::  kick non-friends from /canopy sub
        ~
      :-  :(weld (fact-update [%canopy-config-updated new-cfg]) kick-cards (canopy-broadcast state(cfg new-cfg)))
      state(cfg new-cfg)
    ::
        %add-friend
      =/  new-friends  (~(put in friends.cfg) who.a)
      =/  new-cfg  cfg(friends new-friends)
      :-  (fact-update [%canopy-config-updated new-cfg])
      state(cfg new-cfg)
    ::
        %remove-friend
      =/  new-friends  (~(del in friends.cfg) who.a)
      =/  new-cfg  cfg(friends new-friends)
      :-  (fact-update [%canopy-config-updated new-cfg])
      state(cfg new-cfg)
    ::
        %set-canopy-group
      =/  new-cfg  cfg(group-flag flag.a)
      :-  :(weld (fact-update [%canopy-config-updated new-cfg]) (canopy-broadcast state(cfg new-cfg)))
      state(cfg new-cfg)
    ::
        %set-canopy-name
      =/  new-cfg  cfg(name name.a)
      :-  :(weld (fact-update [%canopy-config-updated new-cfg]) (canopy-broadcast state(cfg new-cfg)))
      state(cfg new-cfg)
    ::
        %subscribe-to
      ?:  (~(has in subs) who.a)  `state
      =/  wire=path  /canopy-sub/(scot %p who.a)
      :_  state(subs (~(put in subs) who.a))
      :~  [%pass wire %agent [who.a %grove] %watch /canopy]
      ==
    ::
        %unsubscribe-from
      ?.  (~(has in subs) who.a)  `state
      =/  wire=path  /canopy-sub/(scot %p who.a)
      :_  %_  state
            subs  (~(del in subs) who.a)
            peers  (~(del by peers) who.a)
          ==
      %+  weld
        `(list card)`~[[%pass wire %agent [who.a %grove] %leave ~]]
      (fact-update [%canopy-peer-removed who.a])
    ==
  ::
  ++  handle-offer
    |=  [from=@p entry=inbox-entry]
    ^-  (quip card _state)
    ?:  (~(has in blocked) from)  `state
    ::  enforce that owner field matches the actual sender
    =/  ent  entry(owner from)
    =/  k=[@p file-id]  [from id.ent]
    =/  auto  (~(has in trusted) from)
    =/  ent2  ent(accepted auto)
    =/  existing  (~(get by inbox) k)
    ?~  existing
      :-  (fact-update [%inbox-added ent2])
      state(inbox (~(put by inbox) k ent2))
    :-  (fact-update [%inbox-updated ent2])
    state(inbox (~(put by inbox) k ent2))
  ::
  ++  fact-update
    |=  u=update
    ^-  (list card)
    [%give %fact ~[/updates] %json !>((update-json u))]~
  ::
  ++  update-json
    |=  u=update
    ^-  json
    =,  enjs:format
    ?-  -.u
        %file-added     (fm-upd-json 'fileAdded' file-meta.u)
        %file-updated   (fm-upd-json 'fileUpdated' file-meta.u)
    ::
        %file-removed
      %-  pairs
      :~  type+s+'fileRemoved'
          ['fileId' s+(scot %uv id.u)]
      ==
    ::
        %view-added
      %-  pairs
      :~  type+s+'viewAdded'
          name+s+name.u
          tags+a+(turn ~(tap in tags.u) |=(t=@tas s+t))
          color+s+color.u
      ==
    ::
        %view-removed
      %-  pairs
      :~  type+s+'viewRemoved'
          name+s+name.u
      ==
    ::
        %share-added
      %-  pairs
      :~  type+s+'shareAdded'
          token+s+(scot %uv token.u)
          ['fileId' s+(scot %uv id.u)]
      ==
    ::
        %share-removed
      %-  pairs
      :~  type+s+'shareRemoved'
          token+s+(scot %uv token.u)
      ==
    ::
        %allowed-updated
      %-  pairs
      :~  type+s+'allowedUpdated'
          ['fileId' s+(scot %uv id.u)]
          ships+a+(turn ~(tap in ships.u) |=(p=@p s+(scot %p p)))
      ==
    ::
        %inbox-added
      %-  pairs
      :~  type+s+'inboxAdded'
          entry+(ie-json entry.u)
      ==
    ::
        %inbox-updated
      %-  pairs
      :~  type+s+'inboxUpdated'
          entry+(ie-json entry.u)
      ==
    ::
        %inbox-removed
      %-  pairs
      :~  type+s+'inboxRemoved'
          owner+s+(scot %p owner.u)
          ['fileId' s+(scot %uv id.u)]
      ==
    ::
        %trusted-updated
      %-  pairs
      :~  type+s+'trustedUpdated'
          trusted+a+(turn ~(tap in trusted.u) |=(p=@p s+(scot %p p)))
          blocked+a+(turn ~(tap in blocked.u) |=(p=@p s+(scot %p p)))
      ==
    ::
        %cache-updated
      %-  pairs
      :~  type+s+'cacheUpdated'
          owner+s+(scot %p owner.u)
          meta+(fm-json file-meta.u)
      ==
    ::
        %cache-removed
      %-  pairs
      :~  type+s+'cacheRemoved'
          owner+s+(scot %p owner.u)
          ['fileId' s+(scot %uv id.u)]
      ==
    ::
        %canopy-entry-added
      %-  pairs
      :~  type+s+'canopyEntryAdded'
          entry+(ce-upd-json canopy-entry.u)
      ==
    ::
        %canopy-entry-removed
      %-  pairs
      :~  type+s+'canopyEntryRemoved'
          ['fileId' s+(scot %uv id.u)]
      ==
    ::
        %canopy-config-updated
      %-  pairs
      :~  type+s+'canopyConfigUpdated'
          config+(cc-upd-json canopy-config.u)
      ==
    ::
        %canopy-peer-updated
      %-  pairs
      :~  type+s+'canopyPeerUpdated'
          listing+(cl-upd-json canopy-listing.u)
      ==
    ::
        %canopy-peer-removed
      %-  pairs
      :~  type+s+'canopyPeerRemoved'
          host+s+(scot %p host.u)
      ==
    ==
  ::
  ++  fm-upd-json
    |=  [typ=@t m=file-meta]
    ^-  json
    %-  pairs:enjs:format
    :~  type+s+typ
        ['fileId' s+(scot %uv id.m)]
        name+s+name.m
        ['fileMark' s+(crip (trip file-mark.m))]
        size+(numb:enjs:format size.m)
        tags+a+(turn ~(tap in tags.m) |=(t=@tas s+t))
        created+s+(scot %da created.m)
        modified+s+(scot %da modified.m)
        description+s+description.m
        starred+b+starred.m
    ==
  ::
  ++  fm-json
    |=  m=file-meta
    ^-  json
    %-  pairs:enjs:format
    :~  id+s+(scot %uv id.m)
        name+s+name.m
        file-mark+s+file-mark.m
        size+(numb:enjs:format size.m)
        tags+a+(turn ~(tap in tags.m) |=(t=@tas s+t))
        created+s+(scot %da created.m)
        modified+s+(scot %da modified.m)
        description+s+description.m
        starred+b+starred.m
    ==
  ::
  ++  ie-json
    |=  e=inbox-entry
    ^-  json
    %-  pairs:enjs:format
    :~  owner+s+(scot %p owner.e)
        ['fileId' s+(scot %uv id.e)]
        name+s+name.e
        ['fileMark' s+(crip (trip file-mark.e))]
        size+(numb:enjs:format size.e)
        offered+s+(scot %da offered.e)
        accepted+b+accepted.e
    ==
  ::
  ++  ce-upd-json
    |=  e=canopy-entry
    ^-  json
    %-  pairs:enjs:format
    :~  id+s+(scot %uv id.e)
        ['displayName' s+display-name.e]
        ['fileMark' s+(crip (trip file-mark.e))]
        size+(numb:enjs:format size.e)
        tags+a+(turn ~(tap in tags.e) |=(t=@tas s+t))
        published+s+(scot %da published.e)
        description+s+description.e
    ==
  ::
  ++  cc-upd-json
    |=  c=canopy-config
    ^-  json
    %-  pairs:enjs:format
    :~  mode+s+(crip (trip mode.c))
        name+s+name.c
        friends+a+(turn ~(tap in friends.c) |=(p=@p s+(scot %p p)))
        :-  %group-flag
        ?~  group-flag.c  ~
        =/  gf  u.group-flag.c
        %-  pairs:enjs:format
        :~  host+s+(scot %p -.gf)
            name+s++.gf
        ==
    ==
  ::
  ++  cl-upd-json
    |=  l=canopy-listing
    ^-  json
    %-  pairs:enjs:format
    :~  host+s+(scot %p host.l)
        name+s+name.l
        mode+s+(crip (trip mode.l))
        entries+a+(turn entries.l ce-upd-json)
    ==
  ::
  ++  canopy-listing-from
    |=  st=_state
    ^-  canopy-listing
    :*  host=our.bowl  name=name.cfg.st  mode=mode.cfg.st
        entries=~(val by canopy.st)
    ==
  ::
  ++  canopy-broadcast
    |=  st=_state
    ^-  (list card)
    [%give %fact ~[/canopy] %grove-canopy-listing !>((canopy-listing-from st))]~
  ::
  ++  dm-notify
    |=  [target=@p tk=share-token fname=@t]
    ^-  card
    =/  host-tape=tape  (slag 1 (trip (scot %p our.bowl)))
    =/  url-tape=tape
      ;:  weld
        "https://"  host-tape  ".tlon.network/grove-share/"
        (trip (scot %uv tk))  "/"  (trip fname)
      ==
    =/  msg-tape=tape
      ;:  weld
        (trip (scot %p our.bowl))  " shared '"  (trip fname)
        "' via Grove: "  url-tape
      ==
    =/  msg=@t  (crip msg-tape)
    =/  sent=@da  now.bowl
    =/  content  `(list [%inline p=(list @t)])`~[[%inline ~[msg]]]
    =/  memo=[content=_content author=@p sent=@da]  [content our.bowl sent]
    =/  delta=[%add memo=_memo kind=~ time=(unit @da)]  [%add memo ~ ~]
    =/  diff=[id=[@p @da] delta=_delta]  [[our.bowl sent] delta]
    =/  act=[target=@p diff=_diff]  [target diff]
    :*  %pass  /notify-dm/(scot %p target)/(scot %uv tk)
        %agent  [our.bowl %chat]  %poke
        %chat-dm-action  !>(act)
    ==
  ::
  ++  handle-http
    |=  [eid=@ta req=inbound-request:eyre]
    ^-  (quip card _this)
    =/  hp  ~[/http-response/[eid]]
    =/  u  (trip url.request.req)
    ?:  =((scag 19 u) "/grove-remote-file/")
      ?.  authenticated.req
        :_  this
        (http-reply hp 403 'text/plain' (as-octs:mimes:html 'unauthorized'))
      =/  rest  (slag 19 u)
      =/  slash  (find "/" rest)
      ?~  slash
        :_  this
        (http-reply hp 404 'text/plain' (as-octs:mimes:html 'bad path'))
      =/  owner-str  (scag u.slash rest)
      =/  id-str     (slag +(u.slash) rest)
      =/  owner=(unit @p)   (slaw %p (crip owner-str))
      =/  fid=(unit @uvH)   (slaw %uv (crip id-str))
      ?~  owner
        :_  this
        (http-reply hp 404 'text/plain' (as-octs:mimes:html 'bad ship'))
      ?~  fid
        :_  this
        (http-reply hp 404 'text/plain' (as-octs:mimes:html 'bad file-id'))
      =/  c  (~(get by cache) [u.owner u.fid])
      ?~  c
        :_  this
        (http-reply hp 404 'text/plain' (as-octs:mimes:html 'not cached'))
      :_  this
      (http-reply hp 200 (content-type file-mark.-.u.c) +.u.c)
    ?:  =((scag 12 u) "/grove-file/")
      ?.  authenticated.req
        :_  this
        (http-reply hp 403 'text/plain' (as-octs:mimes:html 'unauthorized'))
      =/  raw  (slag 12 u)
      =/  fid=(unit @uvH)  (slaw %uv (crip raw))
      ?~  fid
        :_  this
        (http-reply hp 404 'text/plain' (as-octs:mimes:html 'bad file-id'))
      =/  fm  (~(get by f) u.fid)
      ?~  fm
        :_  this
        (http-reply hp 404 'text/plain' (as-octs:mimes:html 'no file'))
      =/  blob  (~(get by b) u.fid)
      ?~  blob
        :_  this
        (http-reply hp 404 'text/plain' (as-octs:mimes:html 'blob missing'))
      :_  this
      (http-reply hp 200 (content-type file-mark.u.fm) u.blob)
    ?.  =((scag 13 u) "/grove-share/")
      :_  this
      (http-reply hp 200 'text/html' (as-octs:mimes:html landing-page))
    =/  rest  (slag 13 u)
    =/  slash  (find "/" rest)
    =/  raw  ?~(slash rest (scag u.slash rest))
    =/  tk=(unit @uvH)  (slaw %uv (crip raw))
    ?~  tk
      :_  this
      (http-reply hp 404 'text/plain' (as-octs:mimes:html 'bad token'))
    =/  fid  (~(get by s) u.tk)
    ?~  fid
      :_  this
      (http-reply hp 404 'text/plain' (as-octs:mimes:html 'no share'))
    =/  fm  (~(get by f) u.fid)
    ?~  fm
      :_  this
      (http-reply hp 404 'text/plain' (as-octs:mimes:html 'no file'))
    =/  blob  (~(get by b) u.fid)
    ?~  blob
      :_  this
      (http-reply hp 404 'text/plain' (as-octs:mimes:html 'blob missing'))
    :_  this
    (http-reply hp 200 (content-type file-mark.u.fm) u.blob)
  ::
  ++  http-reply
    |=  [hp=(list path) status=@ud ctype=@t body=octs]
    ^-  (list card)
    :~  [%give %fact hp %http-response-header !>(`response-header:http`[status ~[['content-type' ctype]]])]
        [%give %fact hp %http-response-data !>(`(unit octs)`(some body))]
        [%give %kick hp ~]
    ==
  ::
  ++  content-type
    |=  mk=@tas
    ^-  @t
    ?+  mk  'application/octet-stream'
      %png   'image/png'
      %jpg   'image/jpeg'
      %jpeg  'image/jpeg'
      %gif   'image/gif'
      %webp  'image/webp'
      %svg   'image/svg+xml'
      %txt   'text/plain'
      %md    'text/markdown'
      %html  'text/html'
      %pdf   'application/pdf'
      %json  'application/json'
      %mp4   'video/mp4'
      %mp3   'audio/mpeg'
    ==
  ::
  ++  landing-page
    ^-  @t
    '<!doctype html><html><head><meta charset=utf-8><title>Grove</title><style>body{margin:0;font-family:system-ui,sans-serif;background:#F7F6F3;color:#1C1C1A;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column}svg{margin-bottom:16px}</style></head><body><svg width=64 height=64 viewBox="0 0 256 256"><rect width=256 height=256 rx=48 fill="#3A6BC5"/></svg><h1 style="font-size:24px;font-weight:500;color:#3A6BC5;margin:0">Grove</h1><p style="font-size:14px;color:#ADADA5;margin:8px 0 0">Sovereign file storage for your ship</p></body></html>'
  --
++  on-peek
  |=  =path
  ^-  (unit (unit cage))
  |^
  ?+  path  (on-peek:def path)
    [%x %count ~]   ``json+!>(`json`(numb:enjs:format ~(wyt by f)))
    [%x %files ~]   ``json+!>(`json`(files-json ~))
    [%x %views ~]   ``json+!>(`json`(views-json ~))
    [%x %shares ~]  ``json+!>(`json`(shares-json ~))
    [%x %view @ ~]
      =/  nm  i.t.t.path
      =/  vw  (~(get by v) nm)
      ?~  vw  ``json+!>(`json`~)
      =/  tg  -.u.vw
      =/  ml  (skim ~(val by f) |=(m=file-meta !=(~ (~(int in tags.m) tg))))
      ``json+!>(`json`[%a (turn ml file-meta-json)])
    [%x %share @ ~]
      =/  tk  (slav %uv i.t.t.path)
      =/  fid  (~(get by s) tk)
      ?~  fid  ``json+!>(`json`~)
      =/  fm  (~(get by f) u.fid)
      ?~  fm  ``json+!>(`json`~)
      ``json+!>(`json`s+name.u.fm)
    [%x %inbox ~]    ``json+!>(`json`(inbox-json ~))
    [%x %trusted ~]  ``json+!>(`json`(trusted-json ~))
    [%x %cache ~]    ``json+!>(`json`(cache-json ~))
    [%x %canopy %entries ~]  ``json+!>(`json`(canopy-entries-json ~))
    [%x %canopy %config ~]   ``json+!>(`json`(canopy-config-json ~))
    [%x %canopy %peers ~]    ``json+!>(`json`(canopy-peers-json ~))
    [%x %canopy %peer @ ~]
      =/  who  (slav %p i.t.t.t.path)
      =/  lst  (~(get by peers) who)
      ?~  lst  ``json+!>(`json`~)
      ``json+!>(`json`(canopy-listing-json u.lst))
    [%x %canopy %search @ ~]
      =/  term=@t  i.t.t.t.path
      ``json+!>(`json`(canopy-search-json term))
    [%x %canopy %groups ~]
      ``json+!>(`json`(available-groups-json ~))
  ==
  ::
  ++  files-json
    |=  *
    ^-  json
    [%a (turn ~(val by f) file-meta-json)]
  ::
  ++  views-json
    |=  *
    ^-  json
    :-  %a
    %+  turn  ~(tap by v)
    |=  [name=@t tags=(set @tas) color=@t]
    ^-  json
    %-  pairs:enjs:format
    :~  name+s+name
        tags+[%a (turn ~(tap in tags) |=(t=@tas s+(crip (trip t))))]
        color+s+color
    ==
  ::
  ++  shares-json
    |=  *
    ^-  json
    :-  %a
    %+  turn  ~(tap by s)
    |=  [tk=@uvH fid=@uvH]
    ^-  json
    =/  fm  (~(get by f) fid)
    %-  pairs:enjs:format
    :~  token+s+(scot %uv tk)
        file-id+s+(scot %uv fid)
        name+s+?~(fm '' name.u.fm)
    ==
  ::
  ++  file-meta-json
    |=  m=file-meta
    ^-  json
    =/  allowed  (~(gut by al) id.m *(set @p))
    %-  pairs:enjs:format
    :~  id+s+(scot %uv id.m)
        name+s+name.m
        file-mark+s+(crip (trip file-mark.m))
        size+(numb:enjs:format size.m)
        tags+[%a (turn ~(tap in tags.m) |=(t=@tas s+(crip (trip t))))]
        created+s+(scot %da created.m)
        modified+s+(scot %da modified.m)
        description+s+description.m
        starred+b+starred.m
        allowed+[%a (turn ~(tap in allowed) |=(p=@p s+(scot %p p)))]
    ==
  ::
  ++  inbox-json
    |=  *
    ^-  json
    :-  %a
    %+  turn  ~(tap by inbox)
    |=  [k=[@p file-id] e=inbox-entry]
    %-  pairs:enjs:format
    :~  owner+s+(scot %p owner.e)
        file-id+s+(scot %uv id.e)
        name+s+name.e
        file-mark+s+(crip (trip file-mark.e))
        size+(numb:enjs:format size.e)
        offered+s+(scot %da offered.e)
        accepted+b+accepted.e
        cached+b+(~(has by cache) k)
    ==
  ::
  ++  trusted-json
    |=  *
    ^-  json
    %-  pairs:enjs:format
    :~  trusted+[%a (turn ~(tap in trusted) |=(p=@p s+(scot %p p)))]
        blocked+[%a (turn ~(tap in blocked) |=(p=@p s+(scot %p p)))]
    ==
  ::
  ++  cache-json
    |=  *
    ^-  json
    :-  %a
    %+  turn  ~(tap by cache)
    |=  [k=[@p file-id] v=[file-meta octs]]
    %-  pairs:enjs:format
    :~  owner+s+(scot %p -.k)
        meta+(file-meta-json -.v)
    ==
  ::
  ++  canopy-entry-json
    |=  e=canopy-entry
    ^-  json
    %-  pairs:enjs:format
    :~  id+s+(scot %uv id.e)
        display-name+s+display-name.e
        file-mark+s+(crip (trip file-mark.e))
        size+(numb:enjs:format size.e)
        tags+[%a (turn ~(tap in tags.e) |=(t=@tas s+(crip (trip t))))]
        published+s+(scot %da published.e)
        description+s+description.e
    ==
  ::
  ++  canopy-entries-json
    |=  *
    ^-  json
    [%a (turn ~(val by canopy) canopy-entry-json)]
  ::
  ++  canopy-config-json
    |=  *
    ^-  json
    %-  pairs:enjs:format
    :~  mode+s+(crip (trip mode.cfg))
        name+s+name.cfg
        friends+[%a (turn ~(tap in friends.cfg) |=(p=@p s+(scot %p p)))]
        subscriptions+[%a (turn ~(tap in subs) |=(p=@p s+(scot %p p)))]
        :-  %group-flag
        ?~  group-flag.cfg  ~
        =/  gf  u.group-flag.cfg
        %-  pairs:enjs:format
        :~  host+s+(scot %p -.gf)
            name+s++.gf
        ==
    ==
  ::
  ++  available-groups-json
    |=  *
    ^-  json
    =/  res=(unit json)
      (mole |.(.^(json %gx /(scot %p our.bowl)/groups/(scot %da now.bowl)/v2/groups/json)))
    ?~  res  [%a ~]
    ?.  ?=([%o *] u.res)  [%a ~]
    :-  %a
    %+  turn  ~(tap by p.u.res)
    |=  [key=@t val=json]
    ^-  json
    =/  ktp=tape  (trip key)
    =/  idx=(unit @ud)  (find "/" ktp)
    =/  host=@t  ?~(idx key (crip (scag u.idx ktp)))
    =/  gname=@t  ?~(idx '' (crip (slag +(u.idx) ktp)))
    =/  title=@t
      ?.  ?=([%o *] val)  ''
      =/  met  (~(get by p.val) 'meta')
      ?~  met  ''
      ?.  ?=([%o *] u.met)  ''
      =/  tit  (~(get by p.u.met) 'title')
      ?~  tit  ''
      ?.  ?=([%s *] u.tit)  ''
      p.u.tit
    =/  members=@ud
      ?.  ?=([%o *] val)  0
      =/  fl  (~(get by p.val) 'fleet')
      ?~  fl  0
      ?.  ?=([%o *] u.fl)  0
      ~(wyt by p.u.fl)
    %-  pairs:enjs:format
    :~  host+s+host
        name+s+gname
        title+s+title
        members+(numb:enjs:format members)
    ==
  ::
  ++  canopy-listing-json
    |=  lst=canopy-listing
    ^-  json
    %-  pairs:enjs:format
    :~  host+s+(scot %p host.lst)
        name+s+name.lst
        mode+s+(crip (trip mode.lst))
        entries+[%a (turn entries.lst canopy-entry-json)]
    ==
  ::
  ++  canopy-peers-json
    |=  *
    ^-  json
    [%a (turn ~(val by peers) canopy-listing-json)]
  ::
  ++  canopy-search-json
    |=  term=@t
    ^-  json
    =/  needle=tape  (cass (trip term))
    :-  %a
    %-  zing
    %+  turn  ~(tap by peers)
    |=  [host=@p lst=canopy-listing]
    %+  turn
      %+  skim  entries.lst
      |=  e=canopy-entry
      ?|  !=(~ (find needle (cass (trip display-name.e))))
          (~(has in tags.e) (crip needle))
      ==
    |=  e=canopy-entry
    ^-  json
    %-  pairs:enjs:format
    :~  host+s+(scot %p host)
        entry+(canopy-entry-json e)
    ==
  --
++  on-watch
  |=  =path
  ^-  (quip card _this)
  =/  src-in-group=?
    ?~  group-flag.cfg  %.n
    =/  gf  u.group-flag.cfg
    =/  res=(unit json)
      (mole |.(.^(json %gx /(scot %p our.bowl)/groups/(scot %da now.bowl)/v2/groups/(scot %p -.gf)/(scot %tas +.gf)/json)))
    ?~  res  %.n
    ?.  ?=([%o *] u.res)  %.n
    =/  fl  (~(get by p.u.res) 'fleet')
    ?~  fl  %.n
    ?.  ?=([%o *] u.fl)  %.n
    (~(has by p.u.fl) (scot %p src.bowl))
  ?+  path  (on-watch:def path)
    [%http-response *]  `this
    [%updates ~]        `this
  ::
      [%file @ ~]
    =/  fid=file-id  (slav %uv i.t.path)
    =/  fm  (~(get by f) fid)
    ?~  fm
      :_  this
      [%give %kick ~ ~]~
    =/  allowed  (~(gut by al) fid *(set @p))
    =/  canopy-ok=?
      ?&  (~(has by canopy) fid)
          ?-  mode.cfg
            %open     %.y
            %friends  (~(has in friends.cfg) src.bowl)
            %group    src-in-group
          ==
      ==
    ?.  ?|  =(our.bowl src.bowl)
            (~(has in allowed) src.bowl)
            canopy-ok
        ==
      :_  this
      :~  [%give %fact ~ %grove-remote !>(`grove-remote`[%denied fid])]
          [%give %kick ~ ~]
      ==
    =/  blob  (~(get by b) fid)
    ?~  blob
      :_  this
      [%give %kick ~ ~]~
    :_  this
    :~  [%give %fact ~ %grove-remote !>(`grove-remote`[%file u.fm u.blob])]
        [%give %kick ~ ~]
    ==
  ::
      [%canopy ~]
    =/  ok=?
      ?-  mode.cfg
        %open     %.y
        %friends  |(=(our.bowl src.bowl) (~(has in friends.cfg) src.bowl))
        %group    |(=(our.bowl src.bowl) src-in-group)
      ==
    ?.  ok
      :_  this
      [%give %kick ~ ~]~
    =/  lst=canopy-listing
      :*  host=our.bowl  name=name.cfg  mode=mode.cfg
          entries=~(val by canopy)
      ==
    :_  this
    :~  [%give %fact ~ %grove-canopy-listing !>(`canopy-listing`lst)]
    ==
  ==
++  on-arvo
  |=  [=wire =sign-arvo]
  ?+  wire  (on-arvo:def wire sign-arvo)
    [%bind ~]         `this
    [%bind-share ~]   `this
    [%bind-file ~]    `this
  ==
++  on-leave  on-leave:def
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  ?+  wire  (on-agent:def wire sign)
      [%offer @ @ ~]
    `this
  ::
      [%notify-dm @ @ ~]
    `this
  ::
      [%canopy-sub @ ~]
    =/  who=@p  (slav %p i.t.wire)
    ?+  -.sign  (on-agent:def wire sign)
        %watch-ack
      ?~  p.sign  `this
      :_  this(subs (~(del in subs) who), peers (~(del by peers) who))
      [%give %fact ~[/updates] %grove-update !>(`update`[%canopy-peer-removed who])]~
    ::
        %kick
      :_  this(subs (~(del in subs) who), peers (~(del by peers) who))
      [%give %fact ~[/updates] %grove-update !>(`update`[%canopy-peer-removed who])]~
    ::
        %fact
      ?.  =(p.cage.sign %grove-canopy-listing)
        (on-agent:def wire sign)
      =/  lst  !<(canopy-listing q.cage.sign)
      :_  this(peers (~(put by peers) who lst))
      [%give %fact ~[/updates] %grove-update !>(`update`[%canopy-peer-updated lst])]~
    ==
  ::
      [%fetch @ @ ~]
    =/  owner=@p     (slav %p i.t.wire)
    =/  id=file-id   (slav %uv i.t.t.wire)
    ?+  -.sign  (on-agent:def wire sign)
        %watch-ack
      ?~  p.sign  `this
      `this
    ::
        %kick
      `this
    ::
        %fact
      ?.  =(p.cage.sign %grove-remote)
        (on-agent:def wire sign)
      =/  rem  !<(grove-remote q.cage.sign)
      ?-  -.rem
          %denied
        `this
      ::
          %file
        =/  k=[@p file-id]  [owner id]
        =/  upd=update  [%cache-updated owner file-meta.rem]
        :_  this(cache (~(put by cache) k [file-meta.rem data.rem]))
        [%give %fact ~[/updates] %grove-update !>(upd)]~
      ==
    ==
  ==
++  on-fail  on-fail:def
--
