declare module 'obj2gltf' {
  interface Obj2GltfOptions {
    binary?: boolean;
    separate?: boolean;
    checkTransparency?: boolean;
    secure?: boolean;
    noCreateNormals?: boolean;
    customAttributeNames?: string[];
    customAttributeTypes?: string[];
    exportNormals?: boolean;
    exportTangents?: boolean;
    exportTextureCoordinates?: boolean;
    convert?: Function;
  }

  function obj2gltf(
    obj: string | Buffer | ArrayBuffer,
    options?: Obj2GltfOptions
  ): Promise<ArrayBuffer>;

  export = obj2gltf;
}