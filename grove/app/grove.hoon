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
::  old canopy types for migration
+$  canopy-mode-old  ?(%open %friends %group)
+$  canopy-config-old
  $:  mode=canopy-mode-old
      friends=(set @p)
      name=@t
      group-flag=(unit [ship term])
  ==
+$  canopy-listing-old
  $:  host=@p
      name=@t
      mode=canopy-mode-old
      entries=(list canopy-entry)
  ==
+$  shared-view-config-old
  $:  allowed=(set @p)
      group-flag=(unit [ship term])
  ==
+$  grove-view-listing-old
  $:  host=@p
      name=@t
      tags=(list tag)
      color=@t
      files=(list file-meta)
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
      peers=(map @p canopy-listing-old)
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
      cfg=canopy-config-old
      peers=(map @p canopy-listing-old)
      subs=(set @p)
  ==
+$  state-7
  $:  %7
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
      cfg=canopy-config-old
      peers=(map @p canopy-listing-old)
      subs=(set @p)
      sv=(map @t shared-view-config-old)
      sv-subs=(map [@p @t] ?)
      sv-peers=(map [@p @t] grove-view-listing-old)
  ==
+$  state-8
  $:  %8
      f=(map file-id file-meta)
      b=(map file-id octs)
      v=(map @t [(set tag) @t])
      s=(map share-token file-id)
      al=(map file-id (set @p))
      inbox=(map [@p file-id] inbox-entry)
      trusted=(set @p)
      blocked=(set @p)
      cache=(map [@p file-id] [file-meta octs])
      ::  catalogs
      catalogs=(map catalog-id catalog-config)
      pub=(map file-id publish-meta)
      cat-subs=(map [@p catalog-id] ?)
      cat-peers=(map [@p catalog-id] catalog-listing)
  ==
+$  versioned-state  $%(state-8 state-7 state-6 state-5 state-4 state-3 state-2 state-1 state-0)
--
%-  agent:dbug
=|  state-8
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
      %8
    :_  this(state old)
    :~  [%pass /bind-share %arvo %e %connect [~ /grove-share] %grove]
        [%pass /bind-file %arvo %e %connect [~ /grove-file] %grove]
        [%pass /bind-remote %arvo %e %connect [~ /grove-remote-file] %grove]
    ==
    ::
    %7  $(old (seven-to-eight old))
    %6  $(old (six-to-seven old))
    %5  $(old (five-to-six old))
    %4  $(old (four-to-five old))
    %3  $(old (three-to-four old))
    %2  $(old (two-to-three old))
    %1  $(old (one-to-two old))
    %0  $(old (zero-to-one old))
  ==
  ::
  ++  seven-to-eight
    |=  s=state-7
    ^-  state-8
    ::  migrate canopy entries to a default catalog
    =/  default-cat=catalog-config
      :*  name=?:(=('' name.cfg.s) 'My catalog' name.cfg.s)
          description=''
          mode=?-(mode.cfg.s %open %public, %friends %pals, %group %group)
          friends=friends.cfg.s
          group-flag=group-flag.cfg.s
          files=~(key by canopy.s)
          created=now.bowl
          modified=now.bowl
      ==
    =/  new-catalogs=(map catalog-id catalog-config)
      ?:  =(~ canopy.s)  ~
      (my ~[default+default-cat])
    ::  migrate publish overrides from canopy entries
    =/  new-pub=(map file-id publish-meta)
      %-  ~(gas by *(map file-id publish-meta))
      %+  turn  ~(tap by canopy.s)
      |=  [fid=file-id ent=canopy-entry]
      :-  fid
      [display-name.ent description.ent tags.ent published.ent]
    ::  migrate subscriptions: old subs watched /canopy on remote ships,
    ::  now we map each to [ship %default] catalog subscription
    =/  new-subs=(map [@p catalog-id] ?)
      %-  ~(gas by *(map [@p catalog-id] ?))
      %+  turn  ~(tap in subs.s)
      |=(who=@p [[who %default] %.y])
    ::  migrate peers similarly
    =/  new-peers=(map [@p catalog-id] catalog-listing)
      %-  ~(gas by *(map [@p catalog-id] catalog-listing))
      %+  turn  ~(tap by peers.s)
      |=  [who=@p lst=canopy-listing-old]
      :-  [who %default]
      :*  host=host.lst
          catalog-id=%default
          name=name.lst
          description=''
          mode=?-(mode.lst %open %public, %friends %pals, %group %group)
          entries=entries.lst
      ==
    :*  %8
        f=f.s  b=b.s  v=v.s  s=s.s  al=al.s  inbox=inbox.s
        trusted=trusted.s  blocked=blocked.s  cache=cache.s
        catalogs=new-catalogs  pub=new-pub
        cat-subs=new-subs  cat-peers=new-peers
    ==
  ::
  ++  six-to-seven
    |=  s=state-6
    ^-  state-7
    :*  %7  f=f.s  b=b.s  v=v.s  s=s.s  al=al.s  inbox=inbox.s
        trusted=trusted.s  blocked=blocked.s  cache=cache.s
        canopy=canopy.s  cfg=cfg.s  peers=peers.s  subs=subs.s
        sv=~  sv-subs=~  sv-peers=~
    ==
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
      =/  new-state  state(f (~(put by f) i fm), b (~(put by b) i data.a))
      :-  (fact-update [%file-added fm])
      new-state
    ::
        %delete
      ?.  (~(has by f) id.a)  `state
      ::  remove from all catalogs
      =/  new-cats=(map catalog-id catalog-config)
        %-  ~(run by catalogs)
        |=  cat=catalog-config
        cat(files (~(del in files.cat) id.a))
      =/  new-pub  (~(del by pub) id.a)
      =/  new-state
        %_  state
          f  (~(del by f) id.a)
          b  (~(del by b) id.a)
          catalogs  new-cats
          pub  new-pub
        ==
      ::  broadcast updated catalogs that contained this file
      =/  broadcast-cards=(list card)
        (catalog-broadcast-for-file id.a new-state)
      :-  (weld (fact-update [%file-removed id.a]) broadcast-cards)
      new-state
    ::
        %rename
      ?.  (~(has by f) id.a)  `state
      =/  o  (~(got by f) id.a)
      =/  new-fm  o(name name.a, modified now.bowl)
      =/  new-f  (~(put by f) id.a new-fm)
      =/  new-state  state(f new-f)
      =/  broadcast-cards  (catalog-broadcast-for-file id.a new-state)
      :-  (weld (fact-update [%file-updated new-fm]) broadcast-cards)
      new-state
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
      =/  new-f  (~(put by f) id.a new-fm)
      =/  new-state  state(f new-f)
      =/  broadcast-cards  (catalog-broadcast-for-file id.a new-state)
      :-  (weld (fact-update [%file-updated new-fm]) broadcast-cards)
      new-state
    ::
        %remove-tags
      ?.  (~(has by f) id.a)  `state
      =/  o  (~(got by f) id.a)
      =/  new-fm  o(tags (~(dif in tags.o) tags.a))
      =/  new-f  (~(put by f) id.a new-fm)
      =/  new-state  state(f new-f)
      =/  broadcast-cards  (catalog-broadcast-for-file id.a new-state)
      :-  (weld (fact-update [%file-updated new-fm]) broadcast-cards)
      new-state
    ::
        %mkview
      =/  new-v  (~(put by v) name.a [tags.a color.a])
      :-  (fact-update [%view-added name.a tags.a color.a])
      state(v new-v)
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
        (dm-notify who new-tk name.fm base-url.a)
      =/  new-s
        ?:  ?|  !notify.a  ?=(^ tk-existing)  =(0 ~(wyt in added))  ==
          s
        (~(put by s) new-tk id.a)
      :-  :(weld (fact-update [%allowed-updated id.a ships.a]) offer-cards share-cards notify-cards)
      state(al (~(put by al) id.a ships.a), s new-s)
    ::
        %offer
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
    ::  ===  catalog actions  ===
    ::
        %create-catalog
      ?:  (~(has by catalogs) id.a)  `state
      =/  cat=catalog-config
        :*  name=name.a
            description=description.a
            mode=mode.a
            friends=~
            group-flag=~
            files=~
            created=now.bowl
            modified=now.bowl
        ==
      :-  (fact-update [%catalog-created id.a cat])
      state(catalogs (~(put by catalogs) id.a cat))
    ::
        %delete-catalog
      ?.  (~(has by catalogs) id.a)  `state
      ::  kick all subscribers to this catalog
      =/  kick-cards=(list card)
        [%give %kick ~[/catalog/(scot %tas id.a)] ~]~
      :-  (weld (fact-update [%catalog-deleted id.a]) kick-cards)
      state(catalogs (~(del by catalogs) id.a))
    ::
        %update-catalog
      =/  cat  (~(get by catalogs) id.a)
      ?~  cat  `state
      =/  new-cat  u.cat(name name.a, description description.a, modified now.bowl)
      =/  new-state  state(catalogs (~(put by catalogs) id.a new-cat))
      :-  (weld (fact-update [%catalog-updated id.a new-cat]) (catalog-broadcast id.a new-state))
      new-state
    ::
        %set-catalog-mode
      =/  cat  (~(get by catalogs) id.a)
      ?~  cat  `state
      =/  new-cat  u.cat(mode mode.a, modified now.bowl)
      =/  new-state  state(catalogs (~(put by catalogs) id.a new-cat))
      :-  (weld (fact-update [%catalog-updated id.a new-cat]) (catalog-broadcast id.a new-state))
      new-state
    ::
        %set-catalog-group
      =/  cat  (~(get by catalogs) id.a)
      ?~  cat  `state
      =/  new-cat  u.cat(group-flag flag.a, modified now.bowl)
      =/  new-state  state(catalogs (~(put by catalogs) id.a new-cat))
      :-  (weld (fact-update [%catalog-updated id.a new-cat]) (catalog-broadcast id.a new-state))
      new-state
    ::
        %add-catalog-friend
      =/  cat  (~(get by catalogs) id.a)
      ?~  cat  `state
      =/  new-cat  u.cat(friends (~(put in friends.u.cat) who.a))
      :-  (fact-update [%catalog-updated id.a new-cat])
      state(catalogs (~(put by catalogs) id.a new-cat))
    ::
        %remove-catalog-friend
      =/  cat  (~(get by catalogs) id.a)
      ?~  cat  `state
      =/  new-cat  u.cat(friends (~(del in friends.u.cat) who.a))
      :-  (fact-update [%catalog-updated id.a new-cat])
      state(catalogs (~(put by catalogs) id.a new-cat))
    ::
        %add-to-catalog
      =/  cat  (~(get by catalogs) id.a)
      ?~  cat  `state
      ?.  (~(has by f) file-id.a)  `state
      =/  new-cat  u.cat(files (~(put in files.u.cat) file-id.a), modified now.bowl)
      =/  new-state  state(catalogs (~(put by catalogs) id.a new-cat))
      ::  store publish overrides
      =/  pm=publish-meta
        [display-name.a description.a tags.a now.bowl]
      =/  new-state  new-state(pub (~(put by pub.new-state) file-id.a pm))
      :-  %+  weld  (fact-update [%catalog-file-added id.a file-id.a])
          (catalog-broadcast id.a new-state)
      new-state
    ::
        %remove-from-catalog
      =/  cat  (~(get by catalogs) id.a)
      ?~  cat  `state
      =/  new-cat  u.cat(files (~(del in files.u.cat) file-id.a), modified now.bowl)
      =/  new-state  state(catalogs (~(put by catalogs) id.a new-cat))
      ::  remove pub override if file not in any other catalog
      =/  still-published=?
        %+  lien  ~(val by catalogs.new-state)
        |=(c=catalog-config (~(has in files.c) file-id.a))
      =/  new-state
        ?.  still-published
          new-state(pub (~(del by pub.new-state) file-id.a))
        new-state
      :-  %+  weld  (fact-update [%catalog-file-removed id.a file-id.a])
          (catalog-broadcast id.a new-state)
      new-state
    ::
        %subscribe-catalog
      =/  k=[@p catalog-id]  [who.a catalog-id.a]
      ?:  (~(has by cat-subs) k)  `state
      =/  wire=path  /cat-sub/(scot %p who.a)/(scot %tas catalog-id.a)
      :_  state(cat-subs (~(put by cat-subs) k %.y))
      :~  [%pass wire %agent [who.a %grove] %watch /catalog/(scot %tas catalog-id.a)]
      ==
    ::
        %unsubscribe-catalog
      =/  k=[@p catalog-id]  [who.a catalog-id.a]
      ?.  (~(has by cat-subs) k)  `state
      =/  wire=path  /cat-sub/(scot %p who.a)/(scot %tas catalog-id.a)
      :_  %_  state
            cat-subs  (~(del by cat-subs) k)
            cat-peers  (~(del by cat-peers) k)
          ==
      %+  weld
        `(list card)`~[[%pass wire %agent [who.a %grove] %leave ~]]
      (fact-update [%catalog-peer-removed who.a catalog-id.a])
    ==
  ::
  ++  handle-offer
    |=  [from=@p entry=inbox-entry]
    ^-  (quip card _state)
    ?:  (~(has in blocked) from)  `state
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
  ::  ===  helpers  ===
  ::
  ++  fact-update
    |=  u=update
    ^-  (list card)
    [%give %fact ~[/updates] %json !>((update-json u))]~
  ::
  ++  is-pal
    |=  who=@p
    ^-  ?
    =/  res=(unit ?)
      %-  mole
      |.(.^(? %gx /(scot %p our.bowl)/pals/(scot %da now.bowl)/mutuals/(scot %p who)/noun))
    ?~  res  %.n
    u.res
  ::
  ++  catalog-access-ok
    |=  [src=@p cat=catalog-config]
    ^-  ?
    ?|  =(our.bowl src)
        ?-  mode.cat
          %public  %.y
          %pals    ?|((~(has in friends.cat) src) (is-pal src))
          %group
            ?~  group-flag.cat  %.n
            =/  gf  u.group-flag.cat
            =/  res=(unit json)
              (mole |.(.^(json %gx /(scot %p our.bowl)/groups/(scot %da now.bowl)/v2/groups/(scot %p -.gf)/(scot %tas +.gf)/json)))
            ?~  res  %.n
            ?.  ?=([%o *] u.res)  %.n
            =/  fl  (~(get by p.u.res) 'fleet')
            ?~  fl  %.n
            ?.  ?=([%o *] u.fl)  %.n
            (~(has by p.u.fl) (scot %p src))
        ==
    ==
  ::
  ++  build-entry
    |=  fid=file-id
    ^-  (unit canopy-entry)
    =/  fm  (~(get by f) fid)
    ?~  fm  ~
    =/  pm  (~(get by pub) fid)
    %-  some
    :*  id=fid
        display-name=?~(pm name.u.fm ?:(=('' display-name.u.pm) name.u.fm display-name.u.pm))
        file-mark=file-mark.u.fm
        size=size.u.fm
        tags=?~(pm tags.u.fm ?:(=(~ tags.u.pm) tags.u.fm tags.u.pm))
        published=?~(pm now.bowl published.u.pm)
        description=?~(pm description.u.fm ?:(=('' description.u.pm) description.u.fm description.u.pm))
    ==
  ::
  ++  build-catalog-listing
    |=  [cid=catalog-id cat=catalog-config]
    ^-  catalog-listing
    =/  entries=(list canopy-entry)
      %+  murn  ~(tap in files.cat)
      |=(fid=file-id (build-entry fid))
    :*  host=our.bowl  catalog-id=cid  name=name.cat
        description=description.cat  mode=mode.cat
        entries=entries
    ==
  ::
  ++  catalog-broadcast
    |=  [cid=catalog-id st=_state]
    ^-  (list card)
    =/  cat  (~(get by catalogs.st) cid)
    ?~  cat  ~
    =/  lst  (build-catalog-listing cid u.cat)
    [%give %fact ~[/catalog/(scot %tas cid)] %grove-catalog-listing !>(lst)]~
  ::
  ++  catalog-broadcast-for-file
    |=  [fid=file-id st=_state]
    ^-  (list card)
    %-  zing
    %+  turn  ~(tap by catalogs.st)
    |=  [cid=catalog-id cat=catalog-config]
    ?.  (~(has in files.cat) fid)  ~
    (catalog-broadcast cid st)
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
        %catalog-created
      %-  pairs
      :~  type+s+'catalogCreated'
          ['catalogId' s+(crip (trip id.u))]
          config+(catalog-config-json config.u)
      ==
    ::
        %catalog-deleted
      %-  pairs
      :~  type+s+'catalogDeleted'
          ['catalogId' s+(crip (trip id.u))]
      ==
    ::
        %catalog-updated
      %-  pairs
      :~  type+s+'catalogUpdated'
          ['catalogId' s+(crip (trip id.u))]
          config+(catalog-config-json config.u)
      ==
    ::
        %catalog-file-added
      %-  pairs
      :~  type+s+'catalogFileAdded'
          ['catalogId' s+(crip (trip catalog-id.u))]
          ['fileId' s+(scot %uv file-id.u)]
      ==
    ::
        %catalog-file-removed
      %-  pairs
      :~  type+s+'catalogFileRemoved'
          ['catalogId' s+(crip (trip catalog-id.u))]
          ['fileId' s+(scot %uv file-id.u)]
      ==
    ::
        %catalog-peer-updated
      %-  pairs
      :~  type+s+'catalogPeerUpdated'
          listing+(catalog-listing-json catalog-listing.u)
      ==
    ::
        %catalog-peer-removed
      %-  pairs
      :~  type+s+'catalogPeerRemoved'
          host+s+(scot %p host.u)
          ['catalogId' s+(crip (trip catalog-id.u))]
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
  ++  ce-json
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
  ++  catalog-config-json
    |=  c=catalog-config
    ^-  json
    %-  pairs:enjs:format
    :~  name+s+name.c
        description+s+description.c
        mode+s+(crip (trip mode.c))
        friends+a+(turn ~(tap in friends.c) |=(p=@p s+(scot %p p)))
        files+a+(turn ~(tap in files.c) |=(fid=file-id s+(scot %uv fid)))
        created+s+(scot %da created.c)
        modified+s+(scot %da modified.c)
        :-  %group-flag
        ?~  group-flag.c  ~
        =/  gf  u.group-flag.c
        %-  pairs:enjs:format
        :~  host+s+(scot %p -.gf)
            name+s++.gf
        ==
    ==
  ::
  ++  catalog-listing-json
    |=  l=catalog-listing
    ^-  json
    %-  pairs:enjs:format
    :~  host+s+(scot %p host.l)
        ['catalogId' s+(crip (trip catalog-id.l))]
        name+s+name.l
        description+s+description.l
        mode+s+(crip (trip mode.l))
        entries+a+(turn entries.l ce-json)
    ==
  ::
  ++  dm-notify
    |=  [target=@p tk=share-token fname=@t burl=@t]
    ^-  card
    =/  url-tape=tape
      ;:  weld
        (trip burl)  "/grove-share/"
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
    ::  catalog scry paths
    [%x %catalogs ~]          ``json+!>(`json`(catalogs-json ~))
    [%x %catalog @ %config ~]
      =/  cid=catalog-id  i.t.t.path
      =/  cat  (~(get by catalogs) cid)
      ?~  cat  ``json+!>(`json`~)
      ``json+!>(`json`(catalog-config-json u.cat))
    [%x %catalog @ %entries ~]
      =/  cid=catalog-id  i.t.t.path
      =/  cat  (~(get by catalogs) cid)
      ?~  cat  ``json+!>(`json`[%a ~])
      =/  entries=(list canopy-entry)
        %+  murn  ~(tap in files.u.cat)
        |=(fid=file-id (build-entry fid))
      ``json+!>(`json`[%a (turn entries ce-json)])
    [%x %catalog-peers ~]    ``json+!>(`json`(catalog-peers-json ~))
    [%x %catalog-subs ~]     ``json+!>(`json`(catalog-subs-json ~))
    [%x %catalog %search @ ~]
      =/  term=@t  i.t.t.t.path
      ``json+!>(`json`(catalog-search-json term))
    [%x %catalog %groups ~]
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
    ::  find which catalogs this file belongs to
    =/  in-catalogs=(list @tas)
      %+  murn  ~(tap by catalogs)
      |=  [cid=catalog-id cat=catalog-config]
      ?:((~(has in files.cat) id.m) `cid ~)
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
        ['inCatalogs' [%a (turn in-catalogs |=(cid=@tas s+(crip (trip cid))))]]
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
  ++  catalogs-json
    |=  *
    ^-  json
    :-  %a
    %+  turn  ~(tap by catalogs)
    |=  [cid=catalog-id cat=catalog-config]
    %-  pairs:enjs:format
    :~  ['catalogId' s+(crip (trip cid))]
        config+(catalog-config-json cat)
    ==
  ::
  ++  catalog-peers-json
    |=  *
    ^-  json
    :-  %a
    %+  turn  ~(tap by cat-peers)
    |=  [k=[@p catalog-id] lst=catalog-listing]
    (catalog-listing-json lst)
  ::
  ++  catalog-subs-json
    |=  *
    ^-  json
    :-  %a
    %+  turn  ~(tap by cat-subs)
    |=  [k=[@p catalog-id] ?]
    %-  pairs:enjs:format
    :~  host+s+(scot %p -.k)
        ['catalogId' s+(crip (trip +.k))]
    ==
  ::
  ++  catalog-search-json
    |=  term=@t
    ^-  json
    =/  needle=tape  (cass (trip term))
    :-  %a
    %-  zing
    %+  turn  ~(tap by cat-peers)
    |=  [k=[@p catalog-id] lst=catalog-listing]
    %+  turn
      %+  skim  entries.lst
      |=  e=canopy-entry
      ?|  !=(~ (find needle (cass (trip display-name.e))))
          (~(has in tags.e) (crip needle))
          !=(~ (find needle (cass (trip description.e))))
      ==
    |=  e=canopy-entry
    ^-  json
    %-  pairs:enjs:format
    :~  host+s+(scot %p host.lst)
        ['catalogId' s+(crip (trip catalog-id.lst))]
        ['catalogName' s+name.lst]
        entry+(ce-json e)
    ==
  ::
  ++  build-entry
    |=  fid=file-id
    ^-  (unit canopy-entry)
    =/  fm  (~(get by f) fid)
    ?~  fm  ~
    =/  pm  (~(get by pub) fid)
    %-  some
    :*  id=fid
        display-name=?~(pm name.u.fm ?:(=('' display-name.u.pm) name.u.fm display-name.u.pm))
        file-mark=file-mark.u.fm
        size=size.u.fm
        tags=?~(pm tags.u.fm ?:(=(~ tags.u.pm) tags.u.fm tags.u.pm))
        published=?~(pm now.bowl published.u.pm)
        description=?~(pm description.u.fm ?:(=('' description.u.pm) description.u.fm description.u.pm))
    ==
  ::
  ++  catalog-config-json
    |=  c=catalog-config
    ^-  json
    %-  pairs:enjs:format
    :~  name+s+name.c
        description+s+description.c
        mode+s+(crip (trip mode.c))
        friends+a+(turn ~(tap in friends.c) |=(p=@p s+(scot %p p)))
        files+a+(turn ~(tap in files.c) |=(fid=file-id s+(scot %uv fid)))
        created+s+(scot %da created.c)
        modified+s+(scot %da modified.c)
        :-  %group-flag
        ?~  group-flag.c  ~
        =/  gf  u.group-flag.c
        %-  pairs:enjs:format
        :~  host+s+(scot %p -.gf)
            name+s++.gf
        ==
    ==
  ::
  ++  ce-json
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
  ++  catalog-listing-json
    |=  l=catalog-listing
    ^-  json
    %-  pairs:enjs:format
    :~  host+s+(scot %p host.l)
        ['catalogId' s+(crip (trip catalog-id.l))]
        name+s+name.l
        description+s+description.l
        mode+s+(crip (trip mode.l))
        entries+a+(turn entries.l ce-json)
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
  --
++  on-watch
  |=  =path
  ^-  (quip card _this)
  |^
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
    ::  check if file is in any public/accessible catalog
    =/  catalog-ok=?
      %+  lien  ~(val by catalogs)
      |=  cat=catalog-config
      ?&  (~(has in files.cat) fid)
          (catalog-access-ok src.bowl cat)
      ==
    ?.  ?|  =(our.bowl src.bowl)
            (~(has in allowed) src.bowl)
            catalog-ok
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
      [%catalog @ ~]
    =/  cid=catalog-id  i.t.path
    =/  cat  (~(get by catalogs) cid)
    ?~  cat
      :_  this
      [%give %kick ~ ~]~
    ?.  (catalog-access-ok src.bowl u.cat)
      :_  this
      [%give %kick ~ ~]~
    =/  lst  (build-catalog-listing cid u.cat)
    :_  this
    :~  [%give %fact ~ %grove-catalog-listing !>(lst)]
    ==
  ==
  ::
  ++  is-pal
    |=  who=@p
    ^-  ?
    =/  res=(unit ?)
      %-  mole
      |.(.^(? %gx /(scot %p our.bowl)/pals/(scot %da now.bowl)/mutuals/(scot %p who)/noun))
    ?~  res  %.n
    u.res
  ::
  ++  catalog-access-ok
    |=  [src=@p cat=catalog-config]
    ^-  ?
    ?|  =(our.bowl src)
        ?-  mode.cat
          %public  %.y
          %pals    ?|((~(has in friends.cat) src) (is-pal src))
          %group
            ?~  group-flag.cat  %.n
            =/  gf  u.group-flag.cat
            =/  res=(unit json)
              (mole |.(.^(json %gx /(scot %p our.bowl)/groups/(scot %da now.bowl)/v2/groups/(scot %p -.gf)/(scot %tas +.gf)/json)))
            ?~  res  %.n
            ?.  ?=([%o *] u.res)  %.n
            =/  fl  (~(get by p.u.res) 'fleet')
            ?~  fl  %.n
            ?.  ?=([%o *] u.fl)  %.n
            (~(has by p.u.fl) (scot %p src))
        ==
    ==
  ::
  ++  build-entry
    |=  fid=file-id
    ^-  (unit canopy-entry)
    =/  fm  (~(get by f) fid)
    ?~  fm  ~
    =/  pm  (~(get by pub) fid)
    %-  some
    :*  id=fid
        display-name=?~(pm name.u.fm ?:(=('' display-name.u.pm) name.u.fm display-name.u.pm))
        file-mark=file-mark.u.fm
        size=size.u.fm
        tags=?~(pm tags.u.fm ?:(=(~ tags.u.pm) tags.u.fm tags.u.pm))
        published=?~(pm now.bowl published.u.pm)
        description=?~(pm description.u.fm ?:(=('' description.u.pm) description.u.fm description.u.pm))
    ==
  ::
  ++  build-catalog-listing
    |=  [cid=catalog-id cat=catalog-config]
    ^-  catalog-listing
    =/  entries=(list canopy-entry)
      %+  murn  ~(tap in files.cat)
      |=(fid=file-id (build-entry fid))
    :*  host=our.bowl  catalog-id=cid  name=name.cat
        description=description.cat  mode=mode.cat
        entries=entries
    ==
  --
++  on-arvo
  |=  [=wire =sign-arvo]
  ?+  wire  (on-arvo:def wire sign-arvo)
    [%bind ~]         `this
    [%bind-share ~]   `this
    [%bind-file ~]    `this
    [%bind-remote ~]  `this
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
      [%cat-sub @ @ ~]
    =/  who=@p         (slav %p i.t.wire)
    =/  cid=catalog-id  i.t.t.wire
    =/  k=[@p catalog-id]  [who cid]
    ?+  -.sign  (on-agent:def wire sign)
        %watch-ack
      ?~  p.sign  `this
      =/  j=json
        %-  pairs:enjs:format
        :~  type+s+'catalogPeerRemoved'
            host+s+(scot %p who)
            ['catalogId' s+(crip (trip cid))]
        ==
      :_  this(cat-subs (~(del by cat-subs) k), cat-peers (~(del by cat-peers) k))
      [%give %fact ~[/updates] %json !>(j)]~
    ::
        %kick
      =/  j=json
        %-  pairs:enjs:format
        :~  type+s+'catalogPeerRemoved'
            host+s+(scot %p who)
            ['catalogId' s+(crip (trip cid))]
        ==
      :_  this(cat-subs (~(del by cat-subs) k), cat-peers (~(del by cat-peers) k))
      [%give %fact ~[/updates] %json !>(j)]~
    ::
        %fact
      ?.  =(p.cage.sign %grove-catalog-listing)
        (on-agent:def wire sign)
      =/  lst  !<(catalog-listing q.cage.sign)
      =/  j=json
        %-  pairs:enjs:format
        :~  type+s+'catalogPeerUpdated'
            :-  %listing
            %-  pairs:enjs:format
            :~  host+s+(scot %p host.lst)
                ['catalogId' s+(crip (trip catalog-id.lst))]
                name+s+name.lst
                description+s+description.lst
                mode+s+(crip (trip mode.lst))
                :-  %entries
                :-  %a
                %+  turn  entries.lst
                |=  e=canopy-entry
                %-  pairs:enjs:format
                :~  id+s+(scot %uv id.e)
                    ['displayName' s+display-name.e]
                    ['fileMark' s+(crip (trip file-mark.e))]
                    size+(numb:enjs:format size.e)
                    tags+a+(turn ~(tap in tags.e) |=(t=@tas s+t))
                    published+s+(scot %da published.e)
                    description+s+description.e
                ==
            ==
        ==
      :_  this(cat-peers (~(put by cat-peers) k lst))
      [%give %fact ~[/updates] %json !>(j)]~
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
