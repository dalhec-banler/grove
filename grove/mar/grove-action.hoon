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
    ++  parse-catalog-mode
      %+  cu
        |=  t=@t
        ^-  catalog-mode
        ?+  t  !!
          %public  %public
          %pals    %pals
          %group   %group
        ==
      so
    ++  parse-catalog-id
      (cu |=(t=@t `@tas`(crip (trip t))) so)
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
          set-allowed+(ot ~[id+parse-id ships+parse-ships notify+bo base-url+so])
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
          ::  catalog actions
          create-catalog+(ot ~[id+parse-catalog-id name+so description+so mode+parse-catalog-mode])
          delete-catalog+(ot ~[id+parse-catalog-id])
          update-catalog+(ot ~[id+parse-catalog-id name+so description+so])
          set-catalog-mode+(ot ~[id+parse-catalog-id mode+parse-catalog-mode])
          set-catalog-group+(ot ~[id+parse-catalog-id flag+parse-group-flag])
          add-catalog-friend+(ot ~[id+parse-catalog-id who+parse-ship])
          remove-catalog-friend+(ot ~[id+parse-catalog-id who+parse-ship])
          add-to-catalog+(ot ~[id+parse-catalog-id file-id+parse-id display-name+so tags+parse-tags description+so])
          remove-from-catalog+(ot ~[id+parse-catalog-id file-id+parse-id])
          subscribe-catalog+(ot ~[who+parse-ship catalog-id+parse-catalog-id])
          unsubscribe-catalog+(ot ~[who+parse-ship catalog-id+parse-catalog-id])
      ==
    ++  parse-group-flag
      |=  jon=json
      ^-  (unit [ship term])
      ?~  jon  ~
      %-  some
      %.  jon
      (ot ~[host+parse-ship name+parse-tag])
    --
  --
++  grow
  |%
  ++  noun  act
  --
++  grad  %noun
--
