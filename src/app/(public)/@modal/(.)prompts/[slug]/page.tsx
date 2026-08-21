import Modal from '@/components/ui/Modal'
import PromptDetail from '@/components/prompt/PromptDetail'

export default async function PromptModalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <Modal>
      <PromptDetail slug={slug} />
    </Modal>
  )
}
