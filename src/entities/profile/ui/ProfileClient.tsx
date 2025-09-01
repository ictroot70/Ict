'use client'

import { ReactElement } from 'react'

import { useGetMyProfileQuery } from '@/entities/profile'

export const ProfileClient = (): ReactElement => {
  const { data, isSuccess } = useGetMyProfileQuery()

  return (
    <>
      {isSuccess && (
        <div className={'profile'}>
          <h1>My Profile</h1>
          <p>My id is: {data?.id}</p>
          <p>My userName is: {data?.userName}</p>
          <p>My firstName is: {data?.firstName}</p>
          <p>My lastName is: {data?.lastName}</p>
          <p>My country is: {data?.country}</p>
          <p>My city is: {data?.city}</p>
          <p>My region is: {data?.region}</p>
          <br />
          <br />
          <div>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia vitae quibusdam, quam
            aliquam dolor qui dolorem quis, consectetur fugit eum, facere inventore explicabo illum?
            Ipsam voluptas ab placeat numquam at! Dolor eum facilis natus dolorem harum vitae quam,
            suscipit nemo velit illum soluta, possimus qui pariatur inventore consequuntur eos
            libero cumque quo omnis consequatur nisi molestias iure quidem. Tenetur illo assumenda
            quis magni, voluptatum numquam ut eaque tempore quibusdam beatae dolorem! Placeat enim
            aut reprehenderit architecto quos saepe sunt odio maiores nam? Assumenda debitis,
            consectetur quibusdam consequuntur atque, libero incidunt et id dolor maiores quos
            voluptatem, ab cupiditate dolorum. Laudantium molestias ea eligendi animi necessitatibus
            fugit fuga illum maiores molestiae dolorem, quibusdam ipsa perferendis eveniet
            blanditiis magnam consequuntur possimus reprehenderit sequi perspiciatis distinctio
            culpa sint quasi cupiditate! Soluta dolorem fugit vel aliquam cupiditate. Aliquid,
            soluta iste quisquam eos autem, voluptates quia ipsam necessitatibus ullam quo
            aspernatur amet, est sapiente in expedita temporibus aperiam cupiditate. Suscipit fugiat
            voluptatem rem ex excepturi assumenda. Fugiat suscipit architecto quidem, quibusdam quia
            ratione sed optio harum tempore ab impedit nihil corrupti pariatur velit accusamus! A
            itaque aspernatur in ipsum cupiditate suscipit repellat facilis ex aliquam, maiores
            dicta modi ab libero laborum neque at autem ut culpa tempore placeat quidem rem
            voluptate labore? Accusamus, error vitae sapiente nam incidunt vero cupiditate assumenda
            eveniet necessitatibus nobis ipsa modi, molestias corporis velit non, possimus odit at
            consequuntur molestiae dicta nihil placeat. Ad fugiat odit expedita qui, necessitatibus,
            voluptates deleniti hic assumenda explicabo perferendis ea, sunt dolore laboriosam
            officiis odio et incidunt cum excepturi! Nemo, magnam. Veritatis delectus modi aliquid
            voluptatem ratione accusantium molestias deleniti, impedit hic tempore autem blanditiis
            voluptatum ad praesentium porro neque consequuntur iure consectetur repudiandae harum
            ipsam quas expedita! Dolor vel deleniti accusantium perferendis amet explicabo
            praesentium assumenda quibusdam veniam, ex nesciunt dolores autem porro facilis, quaerat
            dolore magni eos perspiciatis voluptatum atque nemo maiores vitae. Aliquam accusantium
            magnam provident ut cumque nobis, at enim iste architecto laboriosam dolores recusandae
            nemo nesciunt similique sint alias fuga incidunt amet, animi id aperiam! Accusamus,
            quidem quia impedit totam voluptatem asperiores quasi dignissimos incidunt, nulla
            facere, quaerat cumque vel quod magnam dicta vero? Non dolore dolor incidunt,
            praesentium autem id nam itaque quo aliquid vel molestias voluptate consequuntur quas
            ipsam veritatis unde! Velit totam eligendi officia distinctio porro labore pariatur quod
            fugiat cupiditate, facere molestiae omnis iure quia quasi fugit asperiores veniam eius.
            Libero odit totam, voluptas labore quo quae mollitia tempora, iusto ullam possimus
            cumque obcaecati assumenda sapiente alias vitae sequi. Quos fuga, eius corrupti vero
            ipsa, voluptatem maiores maxime ipsum ab amet praesentium suscipit. Architecto quis sit
            qui incidunt pariatur assumenda provident deserunt delectus amet, eligendi ullam
            doloribus magni sed suscipit accusamus facilis nihil veniam, culpa esse ea nostrum ex,
            cumque itaque! Ratione modi temporibus excepturi officiis explicabo, odit voluptas totam
            quis aut error rem, sint possimus fugiat debitis blanditiis esse, molestiae nihil sit
            voluptates consequatur quae commodi deserunt. Totam, unde debitis cupiditate molestias
            necessitatibus ducimus nobis libero doloremque rem in modi cumque enim laudantium et.
          </div>
        </div>
      )}
    </>
  )
}
