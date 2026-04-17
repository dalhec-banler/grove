/-  *grove
|_  act=action
++  grab
  |%
  ++  noun  action
  ++  json
    =,  dejs:format
    |^  parse-action
    ++  parse-id    (cu |=(t=@t `@uvH`(slav %uv t)) so)
    ++  parse-tag   (cu |=(t=@t `@tas`(crip (trip t))) so)
    ++  parse-tags  (as parse-tag)
    ++  parse-ship  (cu |=(t=@t `@p`(slav %p t)) so)
    ++  parse-ships  (as parse-ship)
    ++  parse-da    (cu |=(t=@t `@da`(slav %da t)) so)
    ++  parse-entry
      %-  ot
      :~  owner+parse-ship  id+parse-id  name+so
          file-mark+parse-tag  size+ni  offered+parse-da  accepted+bo
      ==
    ++  parse-octs
      |=  jon=json
      ^-  octs
      ?>  ?=([%s *] jon)
      (fall (de:base64:mimes:html p.jon) *octs)
    ++  parse-action
      %-  of
      :~  upload+(ot ~[name+so file-mark+parse-tag data+parse-octs tags+parse-tags])
          delete+(ot ~[id+parse-id])
          rename+(ot ~[id+parse-id name+so])
          toggle-star+(ot ~[id+parse-id])
          add-tags+(ot ~[id+parse-id tags+parse-tags])
          remove-tags+(ot ~[id+parse-id tags+parse-tags])
          mkview+(ot ~[name+so tags+parse-tags color+so])
          rmview+(ot ~[name+so])
          share+(ot ~[id+parse-id])
          unshare+(ot ~[token+parse-id])
          set-allowed+(ot ~[id+parse-id ships+parse-ships notify+bo])
          offer+(ot ~[entry+parse-entry])
          accept-offer+(ot ~[owner+parse-ship id+parse-id])
          decline-offer+(ot ~[owner+parse-ship id+parse-id])
          trust-ship+(ot ~[who+parse-ship])
          untrust-ship+(ot ~[who+parse-ship])
          block-ship+(ot ~[who+parse-ship])
          unblock-ship+(ot ~[who+parse-ship])
          fetch+(ot ~[owner+parse-ship id+parse-id])
          plant+(ot ~[owner+parse-ship id+parse-id])
          drop-cache+(ot ~[owner+parse-ship id+parse-id])
          publish+(ot ~[id+parse-id display-name+so tags+parse-tags description+so])
          unpublish+(ot ~[id+parse-id])
          set-canopy-mode+(ot ~[mode+parse-canopy-mode])
          add-friend+(ot ~[who+parse-ship])
          remove-friend+(ot ~[who+parse-ship])
          set-canopy-name+(ot ~[name+so])
          set-canopy-group+(ot ~[flag+parse-group-flag])
          subscribe-to+(ot ~[who+parse-ship])
          unsubscribe-from+(ot ~[who+parse-ship])
      ==
    ++  parse-group-flag
      |=  jon=json
      ^-  (unit [ship term])
      ?~  jon  ~
      %-  some
      %.  jon
      (ot ~[host+parse-ship name+parse-tag])
    ++  parse-canopy-mode
      %+  cu
        |=  t=@t
        ^-  canopy-mode
        ?+  t  !!
          %open     %open
          %friends  %friends
          %group    %group
        ==
      so
    --
  --
++  grow
  |%
  ++  noun  act
  --
++  grad  %noun
--
