|%
+$  file-id      @uvH
+$  tag          @tas
+$  view-id      @uvH
+$  share-token  @uvH
+$  catalog-id   @tas
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
::  catalog access modes
::  %public  - anyone who discovers you can see it
::  %pals    - your Pals + manual friend list
::  %group   - members of a specific Tlon group
::
+$  catalog-mode  ?(%public %pals %group)
::
::  per-catalog configuration
::
+$  catalog-config
  $:  name=@t
      description=@t
      mode=catalog-mode
      friends=(set @p)
      group-flag=(unit [ship term])
      files=(set file-id)
      created=@da
      modified=@da
  ==
::
::  publish overrides — display name/description/tags for published files
::  global per file-id (same across all catalogs)
::
+$  publish-meta
  $:  display-name=@t
      description=@t
      tags=(set tag)
      published=@da
  ==
::
::  wire format for a single entry within a catalog listing
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
::  catalog listing sent to subscribers
::
+$  catalog-listing
  $:  host=@p
      catalog-id=@tas
      name=@t
      description=@t
      mode=catalog-mode
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
      [%set-allowed id=file-id ships=(set @p) notify=? base-url=@t]
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
      ::  catalogs
      [%create-catalog id=catalog-id name=@t description=@t mode=catalog-mode]
      [%delete-catalog id=catalog-id]
      [%update-catalog id=catalog-id name=@t description=@t]
      [%set-catalog-mode id=catalog-id mode=catalog-mode]
      [%set-catalog-group id=catalog-id flag=(unit [ship term])]
      [%add-catalog-friend id=catalog-id who=@p]
      [%remove-catalog-friend id=catalog-id who=@p]
      [%add-to-catalog id=catalog-id file-id=file-id display-name=@t tags=(set tag) description=@t]
      [%remove-from-catalog id=catalog-id file-id=file-id]
      [%subscribe-catalog who=@p catalog-id=catalog-id]
      [%unsubscribe-catalog who=@p catalog-id=catalog-id]
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
      ::  catalogs
      [%catalog-created id=catalog-id config=catalog-config]
      [%catalog-deleted id=catalog-id]
      [%catalog-updated id=catalog-id config=catalog-config]
      [%catalog-file-added catalog-id=catalog-id file-id=file-id]
      [%catalog-file-removed catalog-id=catalog-id file-id=file-id]
      [%catalog-peer-updated =catalog-listing]
      [%catalog-peer-removed host=@p catalog-id=catalog-id]
  ==
::
+$  grove-remote
  $%  [%file =file-meta data=octs]
      [%denied id=file-id]
  ==
--
