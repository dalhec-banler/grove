|%
++  web-root  ^-  (list @t)
  /apps/grove
++  file-root  ^-  path
  /web
++  extension  ^-  ?(%need %path %fall)
  %fall
++  auth  ^-  $@(? [? (list [path ?])])
  &
--
