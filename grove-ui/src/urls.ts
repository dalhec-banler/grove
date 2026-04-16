export function fileUrl(id: string): string {
  return `/grove-file/${id}`;
}

export function remoteFileUrl(owner: string, id: string): string {
  const o = owner.startsWith('~') ? owner.slice(1) : owner;
  return `/grove-remote-file/~${o}/${id}`;
}
