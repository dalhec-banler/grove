|%
+$  file-id      @uvH
+$  tag          @tas
+$  view-id      @uvH
+$  share-token  @uvH
::
+$  file-meta
  $:  id=file-id
      name=@t
      file-mark=@tas
      size=@ud
      tags=(set tag)
      created=@da
      modified=@da
      description=@t
      starred=?
  ==
::
+$  inbox-entry
  $:  owner=@p
      id=file-id
      name=@t
      file-mark=@tas
      size=@ud
      offered=@da
      accepted=?
  ==
::
+$  canopy-mode  ?(%open %friends %group)
::
+$  canopy-entry
  $:  id=file-id
      display-name=@t
      file-mark=@tas
      size=@ud
      tags=(set tag)
      published=@da
      description=@t
  ==
::
+$  canopy-config
  $:  mode=canopy-mode
      friends=(set @p)
      name=@t
      group-flag=(unit [ship term])
  ==
::
+$  canopy-listing
  $:  host=@p
      name=@t
      mode=canopy-mode
      entries=(list canopy-entry)
  ==
::
+$  action
  $%  [%upload name=@t file-mark=@tas data=octs tags=(set tag)]
      [%delete id=file-id]
      [%rename id=file-id name=@t]
      [%toggle-star id=file-id]
      [%add-tags id=file-id tags=(set tag)]
      [%remove-tags id=file-id tags=(set tag)]
      [%mkview name=@t tags=(set tag) color=@t]
      [%rmview name=@t]
      [%share id=file-id]
      [%unshare token=share-token]
      [%set-allowed id=file-id ships=(set @p) notify=?]
      [%offer entry=inbox-entry]
      [%accept-offer owner=@p id=file-id]
      [%decline-offer owner=@p id=file-id]
      [%trust-ship who=@p]
      [%untrust-ship who=@p]
      [%block-ship who=@p]
      [%unblock-ship who=@p]
      [%fetch owner=@p id=file-id]
      [%plant owner=@p id=file-id]
      [%drop-cache owner=@p id=file-id]
      ::  canopy
      [%publish id=file-id display-name=@t tags=(set tag) description=@t]
      [%unpublish id=file-id]
      [%set-canopy-mode mode=canopy-mode]
      [%add-friend who=@p]
      [%remove-friend who=@p]
      [%set-canopy-name name=@t]
      [%set-canopy-group flag=(unit [ship term])]
      [%subscribe-to who=@p]
      [%unsubscribe-from who=@p]
  ==
::
+$  update
  $%  [%file-added =file-meta]
      [%file-removed id=file-id]
      [%file-updated =file-meta]
      [%view-added name=@t tags=(set tag) color=@t]
      [%view-removed name=@t]
      [%share-added token=share-token id=file-id]
      [%share-removed token=share-token]
      [%allowed-updated id=file-id ships=(set @p)]
      [%inbox-added entry=inbox-entry]
      [%inbox-removed owner=@p id=file-id]
      [%inbox-updated entry=inbox-entry]
      [%trusted-updated trusted=(set @p) blocked=(set @p)]
      [%cache-updated owner=@p =file-meta]
      [%cache-removed owner=@p id=file-id]
      ::  canopy
      [%canopy-entry-added =canopy-entry]
      [%canopy-entry-removed id=file-id]
      [%canopy-config-updated =canopy-config]
      [%canopy-peer-updated =canopy-listing]
      [%canopy-peer-removed host=@p]
  ==
::
+$  grove-remote
  $%  [%file =file-meta data=octs]
      [%denied id=file-id]
  ==
--
