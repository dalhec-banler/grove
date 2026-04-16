::  grove helper library
/-  *grove
|%
::  resolve a /grove-share/<token> URL to its file-id
++  token-from-url
  |=  u=@t
  ^-  (unit share-token)
  =/  s  (trip u)
  ?.  =((scag 13 s) "/grove-share/")  ~
  (slaw %uv (crip (slag 13 s)))
--
